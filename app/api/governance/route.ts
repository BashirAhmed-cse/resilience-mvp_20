import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { GovernanceLogEntry } from "@/lib/types"
import crypto from "crypto"

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection<GovernanceLogEntry>("governance_logs")

    const logs = await collection.find({}).sort({ createdAt: -1 }).limit(100).toArray()

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching governance logs:", error)
    return NextResponse.json({ error: "Failed to fetch governance logs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, action, initiator, approvers, details } = body

    const db = await getDatabase()
    const collection = db.collection<GovernanceLogEntry>("governance_logs")

    // Create immutable hash for governance entry
    const timestamp = new Date().toISOString()
    const hashData = `${type}:${action}:${initiator}:${timestamp}:${details}`
    const hash = crypto.createHash("sha256").update(hashData).digest("hex")

    const newEntry: GovernanceLogEntry = {
      id: Date.now().toString(),
      type,
      action,
      initiator,
      approvers: approvers || [],
      timestamp,
      details,
      hash,
      immutable: true,
      createdAt: new Date(),
    }

    const result = await collection.insertOne(newEntry)

    return NextResponse.json({
      ...newEntry,
      _id: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating governance log:", error)
    return NextResponse.json({ error: "Failed to create governance log" }, { status: 500 })
  }
}
