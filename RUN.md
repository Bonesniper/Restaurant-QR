# How to run the website

## 1. Prerequisites

- **Node.js** (v18 or newer) — [nodejs.org](https://nodejs.org)
- **PostgreSQL** — either:
  - Install locally: [postgresql.org](https://www.postgresql.org/download/windows/), or
  - Use a free cloud DB: [Neon](https://neon.tech) or [Supabase](https://supabase.com) (get a connection string)

## 2. Create a database (if using local PostgreSQL)

```bash
# Open psql or pgAdmin and run:
CREATE DATABASE restaurant_qr;
```

If your PostgreSQL user/password are different, note them for the next step.

## 3. Set your database URL

Edit the `.env` file in the project root and set `DATABASE_URL`:

- **Local PostgreSQL** (default user/password):
  ```
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/restaurant_qr?schema=public"
  ```
  (Replace `postgres:postgres` with your PostgreSQL username and password if different.)

- **Neon / Supabase:** paste the connection string they give you.

## 4. Install and setup

Open a terminal in the project folder (`Restaurant QR`) and run:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

## 5. Start the website

```bash
npm run dev
```

Then open your browser to: **http://localhost:3000**

---

## What you’ll see

- **Home page** — “Demo: Open menu” (opens the menu for table 1) and “Staff Dashboard”.
- **Customer flow** — Click “Demo: Open menu” → browse menu, add to cart, checkout (Pay online or Pay at counter), then view order status.
- **Dashboard** — Click “Staff Dashboard” → login with **admin@restaurant.com** / **admin123** → Live orders, Menu management (admin), Order history.

## If you don’t have PostgreSQL yet

1. Sign up at [neon.tech](https://neon.tech) (free).
2. Create a project and copy the connection string.
3. Put it in `.env` as `DATABASE_URL="your-copied-string"`.
4. Run steps 4 and 5 above.
