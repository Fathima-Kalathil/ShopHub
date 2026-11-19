<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::withRatings();

        if ($q = $request->query('q')) {
            $query->where('name', 'ilike', "%{$q}%");
        }
        $category = $request->query('category');
        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        match ($request->query('sort')) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default => $query->orderByDesc('id'),
        };

        return response()->json($query->get()->map->toApi()->values());
    }

    public function show($id)
    {
        $product = Product::withRatings()->find($id);
        abort_if(!$product, 404, 'Product not found');

        $reviews = Review::with('user:id,name')
            ->where('product_id', $product->id)
            ->orderByDesc('id')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at?->toIso8601String(),
                'name' => $r->user?->name,
            ]);

        return response()->json($product->toApi() + ['reviews' => $reviews]);
    }

    public function review(Request $request, $id)
    {
        abort_if(!Product::whereKey($id)->exists(), 404, 'Product not found');
        $data = $request->validate([
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
        ]);

        Review::create($data + ['user_id' => $request->user()->id, 'product_id' => $id]);

        return response()->json(['message' => 'Review added'], 201);
    }

    private function rules(): array
    {
        return [
            'name' => 'required|string|max:200',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'nullable|string|max:100',
            'image_url' => 'nullable|string|max:500',
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $data['category'] = $data['category'] ?? 'General';
        $product = Product::create($data);

        return response()->json(['id' => $product->id], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        abort_if(!$product, 404, 'Product not found');
        $data = $request->validate($this->rules());
        $data['category'] = $data['category'] ?? 'General';
        $product->update($data);

        return response()->json(['message' => 'Product updated']);
    }

    public function destroy($id)
    {
        Product::whereKey($id)->delete();

        return response()->json(['message' => 'Product deleted']);
    }
}
