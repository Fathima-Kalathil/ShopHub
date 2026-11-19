<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['name' => 'ShopHub API', 'status' => 'ok']));

// One-time database setup: open /api/setup?key=<JWT_SECRET> after the first deploy.
// Creates the tables and demo data. Safe to open again, nothing is duplicated.
Route::get('/setup', function (Request $request) {
    $secret = env('JWT_SECRET');
    abort_if(!$secret || !hash_equals($secret, (string) $request->query('key')), 403, 'Invalid setup key');

    Artisan::call('migrate', ['--force' => true]);
    Artisan::call('db:seed', ['--force' => true]);

    return response()->json(['message' => 'Database ready', 'log' => trim(Artisan::output())]);
});

// Public
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Logged-in users (JWT)
Route::middleware('jwt')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/products/{id}/reviews', [ProductController::class, 'review']);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{productId}', [CartController::class, 'update']);
    Route::delete('/cart/{productId}', [CartController::class, 'destroy']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{id}/pay', [OrderController::class, 'pay']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
});

// Admins only (JWT + role check)
Route::middleware(['jwt', 'admin'])->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::get('/admin/stats', [AdminController::class, 'stats']);
    Route::get('/admin/orders', [AdminController::class, 'orders']);
    Route::put('/admin/orders/{id}', [AdminController::class, 'updateOrder']);
    Route::get('/admin/customers', [AdminController::class, 'customers']);
});
