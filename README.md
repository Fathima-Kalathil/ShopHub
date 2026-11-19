# ShopHub: React + Laravel + Postgres e-commerce

- `backend/`  Laravel 12 REST API (PHP 8.2+), JWT auth (firebase/php-jwt), Eloquent, Postgres (Neon)
- `frontend/` React 18 + Vite + Tailwind CSS + React Router

Everything is hosted on Vercel's free plan as two projects: the API (`backend/`) and the site (`frontend/`).
The database is a free Neon Postgres created from Vercel's Storage tab.

Features: product search/filter/sort, product detail with reviews, cart, checkout with mock payment,
order history and cancellation, register/login with JWT, admin panel (stats + product CRUD).

## Run locally
```bash
# API (needs PHP 8.2+ with pdo_pgsql, Composer, and a Postgres database)
cd backend
cp .env.example .env          # set DB_* (or DB_URL) and JWT_SECRET
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve             # http://localhost:8000

# Frontend
cd frontend
cp .env.example .env.local    # VITE_API_URL=http://localhost:8000/api
npm install
npm run dev                   # http://localhost:5173
```
Demo logins: `demo@shophub.com / Demo@123`, admin `admin@shophub.com / Admin@123`.
Test cards: `4111 1111 1111 1111` succeeds, `4000 0000 0000 0000` is declined, any card ending `0000` has insufficient funds.

## Deploy on Vercel (free)

### 1. API project
1. Vercel > Add New > Project > import this repo. Set **Root Directory** to `backend`. Leave the preset as Other.
2. Environment Variables:
   - `DB_URL`: your Neon connection string (Storage > shophub-db > Show secret > `DATABASE_URL_UNPOOLED`, value only)
   - `JWT_SECRET`: a long random string
   - `APP_KEY`: output of `php artisan key:generate --show` (looks like `base64:...`)
3. Deploy.
4. Open `https://<api-domain>/api/setup?key=<your JWT_SECRET>` once. It creates the tables and demo data.
5. Check `https://<api-domain>/api/products`: you should see 10 products.

Use the project's production domain (Project > Domains). Deployment-specific URLs can sit behind Vercel's login page.

### 2. Frontend project
1. Add New > Project > same repo, **Root Directory** `frontend`, preset Vite.
2. Environment Variable: `VITE_API_URL` = `https://<api-domain>/api`
3. Deploy.

### 3. Allow the frontend to call the API (CORS)
In the API project add `FRONTEND_URL` = your frontend URL (for example `https://shophub.vercel.app`, no trailing slash) and redeploy.

### Alternative: create the tables from your computer
Instead of the setup URL, put the same `DB_URL` in `backend/.env` and run `php artisan migrate --seed`.

## API
| Method | Path | Auth |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | no |
| GET | /api/auth/me | JWT |
| GET | /api/products?q=&category=&sort= | no |
| GET | /api/products/{id} | no |
| POST | /api/products/{id}/reviews | JWT |
| POST, PUT, DELETE | /api/products, /api/products/{id} | admin |
| GET, POST | /api/cart | JWT |
| PUT, DELETE | /api/cart/{productId} | JWT |
| GET, POST | /api/orders | JWT |
| POST | /api/orders/{id}/pay, /api/orders/{id}/cancel | JWT |
| GET | /api/admin/stats | admin |

## Where things live (Laravel)
- `vercel.json` and `api/index.php`: Vercel PHP runtime setup
- `routes/api.php` routes, `bootstrap/app.php` middleware aliases and JSON errors
- `app/Http/Middleware/JwtAuth.php` and `AdminOnly.php`: auth and role check
- `app/Http/Controllers/Api/*`: Auth, Product, Cart, Order, Admin
- `app/Models/*`: Eloquent models and relationships
- `database/migrations/*`, `database/seeders/DatabaseSeeder.php`

## Interview talking points
- JWT auth with bcrypt-hashed passwords, custom middleware, role-based admin routes.
- Order creation runs in a DB transaction that locks product rows, checks stock, and decrements it.
- A failed payment cancels the order and restores stock, so inventory stays correct.
- Laravel running serverless on Vercel with managed Postgres (Neon); React frontend deployed separately.
