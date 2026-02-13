import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/io";
import { Decimal } from "@prisma/client/runtime/library";

type CartItem = { menuItemId: string; quantity: number; unitPrice: number };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get("tableId");
  if (!tableId) {
    return NextResponse.json({ error: "tableId required" }, { status: 400 });
  }
  const orders = await prisma.order.findMany({
    where: { tableId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          menuItem: { select: { name: true, imageUrl: true } },
        },
      },
      payment: { select: { status: true, type: true } },
    },
  });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, items: cartItems, paymentType } = body as {
      tableId: string;
      items: CartItem[];
      paymentType: "ONLINE" | "COUNTER";
    };
    if (!tableId || !cartItems?.length || !paymentType) {
      return NextResponse.json(
        { error: "tableId, items, and paymentType required" },
        { status: 400 }
      );
    }
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: { restaurant: true },
    });
    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }
    const order = await prisma.order.create({
      data: {
        tableId,
        status: "PENDING",
        paymentType,
        items: {
          create: cartItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: { select: { name: true, price: true } },
          },
        },
        table: { select: { label: true } },
      },
    });
    const io = getIO();
    if (io) {
      io.to(`dashboard:${table.restaurantId}`).emit("new-order", order);
      io.to(`restaurant:${table.restaurantId}`).emit("new-order", order);
    }
    return NextResponse.json(order);
  } catch (e) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
