<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    private function findOwn(Request $request, $id): Order
    {
        $order = Order::where('id', $id)->where('user_id', $request->user()->id)->first();
        abort_if(!$order, 404, 'Order not found');

        return $order;
    }

    public function index(Request $request)
    {
        $orders = Order::with('items')->where('user_id', $request->user()->id)->orderByDesc('id')->get();

        return response()->json($orders->map->toApi()->values());
    }

    /** Turns the cart into an order. One transaction: lock stock rows, check, create, decrement, clear cart. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'zip' => 'required|string|max:20',
        ]);
        $user = $request->user();

        $order = DB::transaction(function () use ($user, $data) {
            $cart = Cart::where('user_id', $user->id)->first();
            $items = $cart ? $cart->items()->get() : collect();
            abort_if($items->isEmpty(), 400, 'Your cart is empty');

            $products = Product::whereIn('id', $items->pluck('product_id'))->lockForUpdate()->get()->keyBy('id');

            $total = 0;
            foreach ($items as $item) {
                $product = $products[$item->product_id];
                abort_if($item->quantity > $product->stock, 400, "Only {$product->stock} left of {$product->name}");
                $total += $product->price * $item->quantity;
            }

            $order = Order::create($data + ['user_id' => $user->id, 'total' => round($total, 2)]);

            foreach ($items as $item) {
                $product = $products[$item->product_id];
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $item->quantity,
                ]);
                $product->decrement('stock', $item->quantity);
            }

            $cart->items()->delete();

            return $order;
        });

        return response()->json($order->fresh()->toApi(), 201);
    }

    /** Mock payment: 4111... succeeds, 4000... declined, cards ending 0000 have no funds. */
    public function pay(Request $request, $id)
    {
        $order = $this->findOwn($request, $id);
        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'This order is already paid'], 400);
        }

        $card = preg_replace('/\D/', '', (string) $request->input('card'));
        if (strlen($card) !== 16) {
            return response()->json(['message' => 'Enter a 16-digit card number'], 400);
        }
        if ($card === '4000000000000000') {
            return response()->json(['message' => 'Your card was declined. Try another card.'], 402);
        }
        if (str_ends_with($card, '0000')) {
            return response()->json(['message' => 'Insufficient funds on this card'], 402);
        }
        if ($card !== '4111111111111111') {
            return response()->json(['message' => 'Use the test card 4111 1111 1111 1111'], 400);
        }

        $order->update(['payment_status' => 'paid', 'status' => 'processing']);

        return response()->json(['message' => 'Payment successful']);
    }

    public function cancel(Request $request, $id)
    {
        $order = $this->findOwn($request, $id);
        if (!in_array($order->status, ['pending', 'processing'])) {
            return response()->json(['message' => "A {$order->status} order can't be cancelled"], 400);
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                if ($item->product_id) {
                    Product::whereKey($item->product_id)->increment('stock', $item->quantity);
                }
            }
            $order->update(['status' => 'cancelled']);
        });

        return response()->json(['message' => 'Order cancelled']);
    }
}
