<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name', 'description', 'price', 'stock', 'category', 'image_url'];
    protected $casts = ['price' => 'float', 'stock' => 'integer'];

    public function reviews() { return $this->hasMany(Review::class); }
    public function cartItems() { return $this->hasMany(CartItem::class); }
    public function orderItems() { return $this->hasMany(OrderItem::class); }

    /** Product with rating average and review count attached. */
    public function scopeWithRatings($query)
    {
        return $query->withAvg('reviews', 'rating')->withCount('reviews');
    }

    public function toApi(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'stock' => $this->stock,
            'category' => $this->category,
            'image_url' => $this->image_url,
            'rating' => round((float) ($this->reviews_avg_rating ?? 0), 1),
            'reviews_count' => (int) ($this->reviews_count ?? 0),
        ];
    }
}
