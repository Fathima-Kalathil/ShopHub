<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

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
}
