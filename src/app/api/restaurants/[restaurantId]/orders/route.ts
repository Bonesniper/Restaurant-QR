import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { restaurantId } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const start = date
    ? new Date(date)
    : new Date(new Date().setHours(0, 0, 0, 0));
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const orders = await prisma.order.findMany({
    where: {
      table: { restaurantId },
      createdAt: { gte: start, lt: end },
    },
    orderBy: { createdAt: "desc" },
    include: {
      table: { select: { label: true } },
      items: {
        include: { menuItem: { select: { name: true } } },
      },
      payment: { select: { status: true, type: true, amount: true } },
    },
  });
  return NextResponse.json(orders);
}
