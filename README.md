# ShopHub: React + Laravel + Postgres e-commerce

- `backend/`  Laravel 12 REST API (PHP 8.2+), JWT auth (firebase/php-jwt), Eloquent, Postgres
- `frontend/` React 18 + Vite + Tailwind CSS + React Router

Features: product search/filter/sort, product detail with reviews, cart, checkout with mock payment,
order history and cancellation, register/login with JWT, admin panel (stats + product CRUD).

Vercel can't run PHP, so the hosting is split (all free tiers):

| Part | Host |
|---|---|
| React frontend | Vercel |
| Laravel API | Render (Docker, free web service) |
| Postgres database | Neon (create it from Vercel's Storage tab, or at neon.tech) |

## Run locally
```bash
# 1. API (needs PHP 8.2+, Composer, and a Postgres database)
cd backend
cp .env.example .env          # set DB_* (or DB_URL) and JWT_SECRET
composer install
php artisan key:generate
php artisan migrate --seed    # tables + demo data
php artisan serve             # http://localhost:8000

# 2. Frontend
cd frontend
cp .env.example .env.local    # VITE_API_URL=http://localhost:8000/api
npm install
npm run dev                   # http://localhost:5173
```
Demo logins: `demo@shophub.com / Demo@123`, admin `admin@shophub.com / Admin@123`.
Test cards: `4111 1111 1111 1111` succeeds, `4000 0000 0000 0000` is declined, any card ending `0000` has insufficient funds.

## Deploy
1. **Push to GitHub** (this whole folder as one repo).
2. **Database.** In Vercel: Storage > Create Database > Neon, then copy its connection string
   (use the direct, non-pooled one). Or create a free project at neon.tech and copy it from there.
   It looks like `postgresql://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require`.
3. **API on Render.** New > Web Service > connect the repo, set **Root Directory** `backend`, **Runtime** Docker, **Instance** Free.
   Environment variables:
   - `DB_URL` = the Neon connection string
   - `JWT_SECRET` = any long random string
   - `FRONTEND_URL` = your Vercel URL (add it after step 4, then redeploy)

   On every start the container runs `php artisan migrate --force` and the seeder, so tables and demo data appear by themselves.
   Check `https://<your-api>.onrender.com/api/products`.
   (Or use the included `render.yaml`: New > Blueprint.)
4. **Frontend on Vercel.** Add New > Project > same repo, **Root Directory** `frontend`, preset Vite.
   Environment variable: `VITE_API_URL` = `https://<your-api>.onrender.com/api`. Deploy.
5. Put the Vercel URL into `FRONTEND_URL` on Render (CORS) and redeploy the API.

Free-tier note: Render free services go to sleep when idle, so the first request after a break can take about a minute.
Open the API URL once before a demo to wake it up.

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
- `routes/api.php` routes, `bootstrap/app.php` middleware aliases and JSON errors
- `app/Http/Middleware/JwtAuth.php` and `AdminOnly.php` auth and role check
- `app/Http/Controllers/Api/*` Auth, Product, Cart, Order, Admin
- `app/Models/*` Eloquent models and relationships
- `database/migrations/*`, `database/seeders/DatabaseSeeder.php`

## Interview talking points
- JWT auth with bcrypt-hashed passwords, custom middleware, role-based admin routes.
- Order creation runs in a DB transaction that locks product rows, checks stock, and decrements it.
- A failed payment cancels the order and restores stock, so inventory stays correct.
- Dockerized Laravel with an entrypoint that migrates and seeds on start; React on Vercel; managed Postgres.
