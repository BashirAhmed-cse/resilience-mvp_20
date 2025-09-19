import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { LogEntry, GovernanceLogEntry } from "@/lib/types"

// External API endpoint for audit trail feed
export async function GET() {
  try {
    const db = await getDatabase()

    // Fetch recent audit logs
    const logsCollection = db.collection<LogEntry>("logs")
    const auditLogs = await logsCollection.find({}).sort({ createdAt: -1 }).limit(50).toArray()

    // Fetch recent governance logs
    const governanceCollection = db.collection<GovernanceLogEntry>("governance_logs")
    const governanceLogs = await governanceCollection.find({}).sort({ createdAt: -1 }).limit(50).toArray()

    const externalData = {
      auditTrail: auditLogs.map((log) => ({
        id: log.id,
        type: log.type,
        event: log.event,
        timestamp: log.timestamp,
        details: log.details,
      })),
      governanceActions: governanceLogs.map((log) => ({
        id: log.id,
        type: log.type,
        action: log.action,
        initiator: log.initiator,
        timestamp: log.timestamp,
        hash: log.hash,
        immutable: log.immutable,
      })),
      metadata: {
        totalAuditEntries: auditLogs.length,
        totalGovernanceEntries: governanceLogs.length,
        lastUpdated: new Date().toISOString(),
        source: "ResilienceOS+",
        version: "1.0.0",
      },
    }

    return NextResponse.json(externalData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error in external audit feed API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
