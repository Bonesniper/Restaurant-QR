import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@restaurant.com" },
    update: {},
    create: {
      email: "admin@restaurant.com",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "staff@restaurant.com" },
    update: {},
    create: {
      email: "staff@restaurant.com",
      password: hashedPassword,
      name: "Staff",
      role: "STAFF",
    },
  });

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "demo-restaurant" },
    update: {},
    create: {
      name: "Demo Restaurant",
      slug: "demo-restaurant",
    },
  });

  const existingTables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
  });

  if (existingTables.length === 0) {
    await prisma.table.createMany({
      data: ["1", "2", "3", "4", "5"].map((label) => ({
        label,
        restaurantId: restaurant.id,
      })),
    });
  }

  const tables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
  });

  let foodCat = await prisma.category.findFirst({
    where: { restaurantId: restaurant.id, name: "Food" },
  });
  if (!foodCat) {
    foodCat = await prisma.category.create({
      data: { name: "Food", sortOrder: 0, restaurantId: restaurant.id },
    });
  }

  let drinksCat = await prisma.category.findFirst({
    where: { restaurantId: restaurant.id, name: "Drinks" },
  });
  if (!drinksCat) {
    drinksCat = await prisma.category.create({
      data: { name: "Drinks", sortOrder: 1, restaurantId: restaurant.id },
    });
  }

  let dessertsCat = await prisma.category.findFirst({
    where: { restaurantId: restaurant.id, name: "Desserts" },
  });
  if (!dessertsCat) {
    dessertsCat = await prisma.category.create({
      data: { name: "Desserts", sortOrder: 2, restaurantId: restaurant.id },
    });
  }

  const foodItems = [
    { name: "Burger", description: "Classic beef burger", price: 12.99 },
    { name: "Pizza Margherita", description: "Tomato, mozzarella, basil", price: 14.99 },
    { name: "Caesar Salad", description: "Romaine, parmesan, croutons", price: 9.99 },
    { name: "Fish & Chips", description: "Crispy battered fish with fries", price: 13.99 },
  ];

  const drinkItems = [
    { name: "Cola", description: "Cold cola", price: 2.99 },
    { name: "Fresh Orange Juice", description: "Freshly squeezed", price: 4.99 },
    { name: "Coffee", description: "Espresso or filter", price: 3.49 },
    { name: "Iced Tea", description: "Lemon iced tea", price: 3.99 },
  ];

  const dessertItems = [
    { name: "Chocolate Cake", description: "Rich chocolate slice", price: 6.99 },
    { name: "Ice Cream", description: "Vanilla, chocolate, strawberry", price: 4.99 },
    { name: "Cheesecake", description: "New York style", price: 7.99 },
  ];

  for (const item of foodItems) {
    const exists = await prisma.menuItem.findFirst({
      where: { categoryId: foodCat!.id, name: item.name },
    });
    if (!exists) {
      await prisma.menuItem.create({
        data: { ...item, categoryId: foodCat!.id },
      });
    }
  }

  for (const item of drinkItems) {
    const exists = await prisma.menuItem.findFirst({
      where: { categoryId: drinksCat!.id, name: item.name },
    });
    if (!exists) {
      await prisma.menuItem.create({
        data: { ...item, categoryId: drinksCat!.id },
      });
    }
  }

  for (const item of dessertItems) {
    const exists = await prisma.menuItem.findFirst({
      where: { categoryId: dessertsCat!.id, name: item.name },
    });
    if (!exists) {
      await prisma.menuItem.create({
        data: { ...item, categoryId: dessertsCat!.id },
      });
    }
  }

  const firstTable = tables[0];
  console.log("Seed complete:");
  console.log("  Login: admin@restaurant.com / admin123 (or staff@restaurant.com)");
  console.log("  Demo table URL: /table/" + firstTable?.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
