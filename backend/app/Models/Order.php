<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['user_id', 'total', 'status', 'payment_status', 'address', 'city', 'zip'];
    protected $casts = ['total' => 'float'];

    public function user() { return $this->belongsTo(User::class); }
    public function items() { return $this->hasMany(OrderItem::class); }

    public function toApi(): array
    {
        return [
            'id' => $this->id,
            'total' => $this->total,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'address' => $this->address,
            'city' => $this->city,
            'zip' => $this->zip,
            'created_at' => $this->created_at?->toIso8601String(),
            'items' => $this->relationLoaded('items')
                ? $this->items->map(fn ($i) => ['name' => $i->name, 'price' => $i->price, 'quantity' => $i->quantity])->values()
                : [],
        ];
    }
}
