import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    const collection = db.collection("audit_logs")

    const auditLogs = await collection.find({}).sort({ timestampUTC: -1 }).toArray()

    return NextResponse.json(
      auditLogs.map((log) => ({
        _id: log._id,
        timestampUTC: log.timestampUTC,
        actor: log.actor,
        action: log.action,
        prevState: log.prevState,
        nextState: log.nextState,
        nav: log.nav,
        liquidityPct: log.liquidityPct,
      })),
    )
  } catch (error) {
    console.error("Error fetching audit log:", error)
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 })
  }
}
