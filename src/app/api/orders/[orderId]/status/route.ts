import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getIO } from "@/lib/io";

const VALID_STATUSES = ["PENDING", "PREPARING", "READY", "SERVED", "COMPLETED"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { orderId } = await params;
  const body = await request.json();
  const { status } = body as { status: string };
  if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { table: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as (typeof VALID_STATUSES)[number] },
    include: {
      items: { include: { menuItem: { select: { name: true } } } },
      table: { select: { label: true } },
    },
  });
  const io = getIO();
  if (io) {
    io.to(`table:${order.tableId}`).emit("order-status", { orderId, status });
  }
  return NextResponse.json(updated);
}
