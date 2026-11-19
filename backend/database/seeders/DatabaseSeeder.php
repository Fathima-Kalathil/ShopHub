<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Safe to run on every deploy: nothing is duplicated. */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@shophub.com'],
            ['name' => 'Admin', 'password' => 'Admin@123', 'role' => 'admin']
        );
        $demo = User::firstOrCreate(
            ['email' => 'demo@shophub.com'],
            ['name' => 'Demo Customer', 'password' => 'Demo@123', 'role' => 'customer']
        );

        if (Product::count() > 0) {
            return;
        }

        $img = fn (string $seed) => "https://picsum.photos/seed/{$seed}/600/450";
        $products = [
            ['Wireless Headphones Pro', 'Active noise cancellation, 30-hour battery and Bluetooth 5.0.', 99.99, 45, 'Electronics', 'headphones'],
            ['USB-C Fast Charger 65W', 'Charges a laptop and a phone at the same time.', 34.99, 12, 'Accessories', 'charger'],
            ['Tempered Glass Screen Protector', 'Two-pack, scratch resistant, bubble-free install.', 9.99, 156, 'Accessories', 'protector'],
            ['Portable Power Bank 20000mAh', 'Fast charging, two USB ports and one USB-C.', 44.99, 28, 'Electronics', 'powerbank'],
            ['Shockproof Phone Case', 'Slim grip with corner shock absorption.', 19.99, 89, 'Accessories', 'phonecase'],
            ['Aluminum Laptop Stand', 'Adjustable height, folds flat for travel.', 39.99, 34, 'Accessories', 'laptopstand'],
            ['Wireless Mouse', 'Quiet clicks, 2.4GHz receiver and 18-month battery.', 29.99, 67, 'Electronics', 'mouse'],
            ['7-Port USB 3.0 Hub', 'High-speed data transfer with individual switches.', 24.99, 41, 'Accessories', 'usbhub'],
            ['Mechanical Keyboard', 'Hot-swappable switches with white backlight.', 74.99, 22, 'Electronics', 'keyboard'],
            ['Bluetooth Speaker', 'Water resistant, 12-hour playtime.', 49.99, 38, 'Electronics', 'speaker'],
        ];

        $first = null;
        foreach ($products as [$name, $description, $price, $stock, $category, $seed]) {
            $p = Product::create([
                'name' => $name, 'description' => $description, 'price' => $price,
                'stock' => $stock, 'category' => $category, 'image_url' => $img($seed),
            ]);
            $first ??= $p;
        }

        Review::create([
            'user_id' => $demo->id,
            'product_id' => $first->id,
            'rating' => 5,
            'comment' => 'Great sound and the battery really lasts.',
        ]);
    }
}
