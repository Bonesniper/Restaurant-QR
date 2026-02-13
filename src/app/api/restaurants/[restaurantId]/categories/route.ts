import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { restaurantId } = await params;
  const categories = await prisma.category.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" },
    include: { items: true },
  });
  return NextResponse.json(categories);
}

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
  const { name, sortOrder } = body as { name: string; sortOrder?: number };
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const category = await prisma.category.create({
    data: {
      restaurantId,
      name,
      sortOrder: sortOrder ?? 0,
    },
  });
  return NextResponse.json(category);
}
