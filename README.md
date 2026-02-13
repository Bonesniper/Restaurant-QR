# Restaurant QR Order Platform

A QR-code based restaurant ordering system with a **customer view** (mobile-first) and a **management dashboard** (staff/admin). Built with Next.js, Prisma, PostgreSQL, Socket.io, and TailwindCSS.

## Features

### Customer flow
- Scan QR at table → opens restaurant menu for that table
- Browse categories (Food, Drinks, Desserts)
- Add/remove items, view cart summary
- Checkout: Pay online (mock) or pay at counter
- Order confirmation and **live order status** (Pending → Preparing → Ready → Served)
- View current and previous orders for the table

### Management dashboard (staff login)
- **Live incoming orders** (real-time via WebSockets)
- Orders grouped by table
- Change order status: Pending → Preparing → Ready → Served → Completed
- View payment type (Online / Counter)
- **Sound + visual alert** on new order
- **Order history** by date

### Admin only
- CRUD menu categories
- CRUD menu items
- Upload item image
- Toggle item availability

## Tech stack

- **Frontend:** Next.js 14 (App Router), React, TailwindCSS
- **Backend:** Next.js API routes
- **Database:** PostgreSQL with Prisma ORM
- **Realtime:** Socket.io (custom server)
- **Auth:** JWT (httpOnly cookie) for staff/admin only; customers do not log in
- **Payment:** Mock gateway (simulate success/failure via `simulateFailure` body param)

## Project structure

```
├── prisma/
│   ├── schema.prisma    # Restaurant, Table, Category, MenuItem, Order, OrderItem, Payment, User
│   └── seed.ts          # Demo restaurant, tables, categories, items, admin/staff users
├── server.js            # Custom server: Next.js + Socket.io
├── src/
│   ├── app/
│   │   ├── api/         # Auth, tables, restaurants, menu, orders, payment, upload, demo
│   │   ├── dashboard/   # Login, orders, menu management, history
│   │   ├── table/[id]/  # Customer menu, cart, checkout; table/[id]/orders
│   │   ├── layout.tsx
│   │   └── page.tsx     # Home with links to dashboard and demo table
│   ├── components/      # Customer (MenuView, CartSummary), Dashboard (AuthGuard)
│   ├── hooks/           # useOrderStatusUpdates, useNewOrders
│   ├── lib/             # prisma, auth, io
│   └── types/
└── package.json
```

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Database**
   - Create a PostgreSQL database.
   - Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_qr?schema=public"
     JWT_SECRET="your-secret"
     ```

3. **Prisma**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   App: http://localhost:3000  
   Socket.io is served on the same server at path `/api/socket`.

## Seed data

- **Users:**  
  - Admin: `admin@restaurant.com` / `admin123`  
  - Staff: `staff@restaurant.com` / `admin123`
- **Restaurant:** Demo Restaurant with slug `demo-restaurant`
- **Tables:** 1–5
- **Categories:** Food, Drinks, Desserts with sample menu items

After seeding, the home page “Demo: Open menu” link will point to the first table. You can also use any table ID from the database (e.g. via `npx prisma studio`) as `/table/<tableId>`.

## API overview

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/auth/login` | POST | No | Staff login (email, password) |
| `/api/auth/logout` | POST | No | Clear auth cookie |
| `/api/auth/me` | GET | Cookie | Current user |
| `/api/tables/[tableId]` | GET | No | Table + restaurant info |
| `/api/restaurants` | GET | No | List restaurants |
| `/api/restaurants/[id]/menu` | GET | No | Categories + items (available only) |
| `/api/orders` | GET | No | Orders for `?tableId=` |
| `/api/orders` | POST | No | Create order (tableId, items, paymentType) |
| `/api/orders/[id]/status` | PATCH | Yes | Update order status |
| `/api/payment` | POST | No | Mock payment (orderId, simulateFailure?) |
| `/api/restaurants/[id]/orders` | GET | Yes | Daily orders `?date=` |
| `/api/restaurants/[id]/categories` | GET/POST | Yes | List/create categories (POST admin) |
| `/api/restaurants/[id]/categories/[cid]` | PATCH/DELETE | Admin | Update/delete category |
| `/api/restaurants/[id]/items` | POST | Admin | Create menu item |
| `/api/restaurants/[id]/items/[iid]` | PATCH/DELETE | Admin | Update/delete item, toggle availability |
| `/api/upload` | POST | Admin | Upload image (returns `url`) |
| `/api/demo/table` | GET | No | First table ID for demo link |

## Realtime (Socket.io)

- **Path:** `/api/socket`
- **Customer:** joins room `table:<tableId>`; receives `order-status` when staff updates status.
- **Dashboard:** joins room `dashboard:<restaurantId>`; receives `new-order` when a customer places an order.
- Custom server in `server.js` attaches Socket.io to the same HTTP server as Next.js.

## Mock payment

- `POST /api/payment` with `{ orderId, simulateFailure?: boolean }`.
- `simulateFailure: true` → payment status `FAILED`; otherwise `SUCCESS`.
- Payment record is created/updated; order is not changed by payment (customer flow already creates order then optionally calls payment for “Pay online”).

## License

MIT.
