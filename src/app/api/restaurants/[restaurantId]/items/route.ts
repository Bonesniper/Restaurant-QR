import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { restaurantId } = await params;
  const body = await request.json();
  const { name, description, price, imageUrl, categoryId, available } = body as {
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    categoryId: string;
    available?: boolean;
  };
  if (!name || price == null || !categoryId) {
    return NextResponse.json({ error: "name, price, categoryId required" }, { status: 400 });
  }
  const item = await prisma.menuItem.create({
    data: {
      categoryId,
      name,
      description: description ?? null,
      price: new Decimal(price),
      imageUrl: imageUrl ?? null,
      available: available ?? true,
    },
  });
  return NextResponse.json(item);
}
