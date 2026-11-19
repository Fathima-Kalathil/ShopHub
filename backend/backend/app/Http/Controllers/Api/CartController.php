<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private function cart(Request $request): Cart
    {
        return Cart::firstOrCreate(['user_id' => $request->user()->id]);
    }

    public function index(Request $request)
    {
        $items = $this->cart($request)->items()->with('product')->orderBy('id')->get();

        return response()->json($items->map(fn ($i) => [
            'product_id' => $i->product_id,
            'name' => $i->product->name,
            'price' => $i->product->price,
            'image_url' => $i->product->image_url,
            'stock' => $i->product->stock,
            'quantity' => $i->quantity,
        ])->values());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'productId' => 'required|integer|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $product = Product::find($data['productId']);
        if ($product->stock < 1) {
            return response()->json(['message' => 'This product is out of stock'], 400);
        }

        $item = $this->cart($request)->items()->firstOrNew(['product_id' => $product->id]);
        $current = $item->exists ? $item->quantity : 0;
        $item->quantity = min($current + ($data['quantity'] ?? 1), $product->stock);
        $item->save();

        return response()->json(['message' => 'Added to cart'], 201);
    }

    public function update(Request $request, $productId)
    {
        $data = $request->validate(['quantity' => 'required|integer|min:1']);

        $item = $this->cart($request)->items()->where('product_id', $productId)->with('product')->first();
        abort_if(!$item, 404, 'Item not in your cart');

        $item->update(['quantity' => min($data['quantity'], $item->product->stock)]);

        return response()->json(['message' => 'Cart updated']);
    }

    public function destroy(Request $request, $productId)
    {
        $this->cart($request)->items()->where('product_id', $productId)->delete();

        return response()->json(['message' => 'Removed from cart']);
    }
}
