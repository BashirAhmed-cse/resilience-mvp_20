import type { GovernanceLogEntry } from "./types"

export class AuditLogger {
  static async logSystemChange(entityId: string, action: string, before: any, after: any, userId = "system") {
    try {
      await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "system",
          entityId,
          action,
          before,
          after,
          userId,
        }),
      })
    } catch (error) {
      console.error("Failed to log system change:", error)
    }
  }

  static async logGovernanceAction(
    type: GovernanceLogEntry["type"],
    action: string,
    initiator: string,
    details: string,
    approvers: string[] = [],
  ) {
    try {
      await fetch("/api/governance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          action,
          initiator,
          approvers,
          details,
        }),
      })
    } catch (error) {
      console.error("Failed to log governance action:", error)
    }
  }

  static async logUserAction(
    entityType: string,
    entityId: string,
    action: string,
    userId: string,
    before?: any,
    after?: any,
  ) {
    try {
      await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          action,
          before,
          after,
          userId,
        }),
      })
    } catch (error) {
      console.error("Failed to log user action:", error)
    }
  }
}
