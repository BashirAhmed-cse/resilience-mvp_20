import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { AuditTrail } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get("entityType")
    const entityId = searchParams.get("entityId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const db = await getDatabase()
    const collection = db.collection<AuditTrail>("audit_trails")

    const query: any = {}
    if (entityType) query.entityType = entityType
    if (entityId) query.entityId = entityId

    const trails = await collection.find(query).sort({ createdAt: -1 }).limit(limit).toArray()

    return NextResponse.json(trails)
  } catch (error) {
    console.error("Error fetching audit trails:", error)
    return NextResponse.json({ error: "Failed to fetch audit trails" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entityType, entityId, action, before, after, userId } = body

    const db = await getDatabase()
    const collection = db.collection<AuditTrail>("audit_trails")

    // Get client info from headers
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const newTrail: AuditTrail = {
      id: Date.now().toString(),
      entityType,
      entityId,
      action,
      before,
      after,
      userId,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(newTrail)

    return NextResponse.json({
      ...newTrail,
      _id: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating audit trail:", error)
    return NextResponse.json({ error: "Failed to create audit trail" }, { status: 500 })
  }
}
