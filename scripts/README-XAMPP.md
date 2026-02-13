# XAMPP: Import database from SQL file

## Option A – Import the SQL file (recommended)

**Important:** In phpMyAdmin you must import **`database.sql`** (the SQL file), **NOT** `scripts/generate-xampp-sql.js` (that is a Node.js script, not SQL).

1. **Get database.sql**  
   It is in the **project root** (same folder as `package.json`).  
   If it’s missing, generate it first:
   ```bash
   npm run db:sql
   ```
   That creates **`database.sql`** in the project root.

2. **Import in XAMPP:**
   - Start XAMPP and start **MySQL**.
   - Open **http://localhost/phpmyadmin**
   - Click **Import** (top tab).
   - Click **Choose File** and select **`database.sql`** (from the project root, **not** the .js file).
   - Click **Go** at the bottom.
   - When it finishes, the database **restaurant_qr** will exist with all tables and seed data.

3. **Run the app:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000  
   Login: **admin@restaurant.com** / **admin123**

---

## Option B – Use Prisma (no SQL file)

If you prefer to let Prisma create tables (no manual import):

1. Create an **empty** database **restaurant_qr** in phpMyAdmin (New → name: restaurant_qr → Create).
2. In `.env` set: `DATABASE_URL="mysql://root:@localhost:3306/restaurant_qr"`
3. Run:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
