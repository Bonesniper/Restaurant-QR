import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  const { tableId } = await params;
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      restaurant: { select: { id: true, name: true, slug: true, logoUrl: true } },
    },
  });
  if (!table) {
    return NextResponse.json({ error: "Table not found" }, { status: 404 });
  }
  return NextResponse.json(table);
}
