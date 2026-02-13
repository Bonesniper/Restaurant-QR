import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, simulateFailure } = body as { orderId: string; simulateFailure?: boolean };
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const total = order.items.reduce(
      (sum, i) => sum + Number(i.unitPrice) * i.quantity,
      0
    );
    const success = !simulateFailure;
    const payment = await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        type: order.paymentType ?? "ONLINE",
        amount: total,
        status: success ? "SUCCESS" : "FAILED",
        gatewayRef: success ? `mock_${Date.now()}` : null,
      },
      update: {
        status: success ? "SUCCESS" : "FAILED",
        gatewayRef: success ? `mock_${Date.now()}` : null,
      },
    });
    return NextResponse.json({
      success,
      paymentId: payment.id,
      status: payment.status,
    });
  } catch (e) {
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
