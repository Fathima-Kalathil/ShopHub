<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'products' => Product::count(),
            'orders' => Order::count(),
            'customers' => User::where('role', 'customer')->count(),
            'revenue' => (float) Order::where('payment_status', 'paid')->sum('total'),
        ]);
    }

    /** All orders (newest first), optionally filtered by ?status=, plus a count per status for the tabs. */
    public function orders(Request $request)
    {
        $query = Order::with(['items', 'user:id,name,email'])->orderByDesc('id');
        $status = $request->query('status');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $orders = $query->get()->map(function (Order $o) {
            return $o->toApi() + ['customer' => ['name' => $o->user?->name, 'email' => $o->user?->email]];
        });

        $counts = Order::select('status', DB::raw('count(*) as n'))->groupBy('status')->pluck('n', 'status');

        return response()->json(['orders' => $orders->values(), 'counts' => $counts]);
    }

    /** Change an order's status. Cancelling puts the stock back; a cancelled order can't be reopened. */
    public function updateOrder(Request $request, $id)
    {
        $data = $request->validate(['status' => 'required|in:pending,processing,shipped,delivered,cancelled']);

        $order = Order::with('items')->find($id);
        abort_if(!$order, 404, 'Order not found');

        if ($order->status === 'cancelled' && $data['status'] !== 'cancelled') {
            abort(400, "A cancelled order can't be reopened");
        }

        DB::transaction(function () use ($order, $data) {
            if ($data['status'] === 'cancelled' && $order->status !== 'cancelled') {
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::whereKey($item->product_id)->increment('stock', $item->quantity);
                    }
                }
            }
            $order->update(['status' => $data['status']]);
        });

        return response()->json(['message' => 'Order updated']);
    }

    public function customers()
    {
        $customers = User::where('role', 'customer')
            ->withCount('orders')
            ->withSum(['orders as total_spent' => fn ($q) => $q->where('payment_status', 'paid')], 'total')
            ->orderByDesc('id')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'orders_count' => $u->orders_count,
                'total_spent' => (float) ($u->total_spent ?? 0),
                'joined' => $u->created_at?->toIso8601String(),
            ]);

        return response()->json($customers->values());
    }
}
