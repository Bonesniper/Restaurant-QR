import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const table = await prisma.table.findFirst({
    orderBy: { id: "asc" },
    include: {
      restaurant: { select: { id: true, name: true } },
    },
  });
  if (!table) {
    return NextResponse.json({ error: "No table found. Run seed." }, { status: 404 });
  }
  return NextResponse.json({ tableId: table.id });
}
