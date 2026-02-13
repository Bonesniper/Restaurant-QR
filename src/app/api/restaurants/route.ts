import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, name: true, slug: true, logoUrl: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(restaurants);
}
