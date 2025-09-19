import { NextResponse } from "next/server"
import { integrationManager } from "@/lib/integration-manager"

export async function GET() {
  try {
    const healthStatus = await integrationManager.healthCheck()

    return NextResponse.json({
      status: "ok",
      integrations: healthStatus,
      overall: Object.values(healthStatus)
        .filter((result) => typeof result === "object" && "status" in result)
        .every((result) => result.status === "healthy")
        ? "healthy"
        : "degraded",
    })
  } catch (error) {
    console.error("Error in integrations health check:", error)
    return NextResponse.json(
      {
        status: "error",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
