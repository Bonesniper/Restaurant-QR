import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { Decimal } from "@prisma/client/runtime/library";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string; itemId: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { itemId } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};
  if (body.name != null) data.name = body.name;
  if (body.description != null) data.description = body.description;
  if (body.price != null) data.price = new Decimal(body.price);
  if (body.imageUrl != null) data.imageUrl = body.imageUrl;
  if (body.available != null) data.available = body.available;
  if (body.categoryId != null) data.categoryId = body.categoryId;
  const item = await prisma.menuItem.update({
    where: { id: itemId },
    data,
  });
  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ restaurantId: string; itemId: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { itemId } = await params;
  await prisma.menuItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
