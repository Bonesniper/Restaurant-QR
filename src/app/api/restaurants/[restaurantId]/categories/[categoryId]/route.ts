import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string; categoryId: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { categoryId } = await params;
  const body = await request.json();
  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(body.name != null && { name: body.name }),
      ...(body.sortOrder != null && { sortOrder: body.sortOrder }),
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ restaurantId: string; categoryId: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { categoryId } = await params;
  await prisma.category.delete({ where: { id: categoryId } });
  return NextResponse.json({ ok: true });
}
