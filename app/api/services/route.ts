import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema/services";
import { eq, desc, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      assetId,
      title,
      description,
      serviceType,
      location,
      priority,
      reportedBy,
      status,
    } = body;

    if (!assetId || !title || !serviceType || !reportedBy) {
      return NextResponse.json(
        {
          error: "Missing required fields: assetId, title, serviceType, reportedBy",
        },
        { status: 400 }
      );
    }

    const newService = await db
      .insert(services)
      .values({
        assetId,
        title,
        description,
        serviceType,
        location,
        priority: priority || "medium",
        reportedBy,
        status: status || "pending",
        reportedAt: new Date(),
        notificationSent: false,
      })
      .returning();

    return NextResponse.json(newService[0], { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get("assetId");
    const status = searchParams.get("status");

    const conditions = [];

    if (assetId) {
      conditions.push(eq(services.assetId, assetId as string));
    }

    if (status) {
      conditions.push(eq(services.status, status as any));
    }

    let query = db.select().from(services);
    
    if (conditions.length > 0) {
      //@ts-expect-error: Drizzle and() helper spread operator type mismatch
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(services.reportedAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing service id" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(services)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(services.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}
