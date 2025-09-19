"use client"

import { useState, useEffect, useCallback } from "react"

interface SystemData {
  nav: number
  liquidityPct: number
  state: "normal" | "cyber" | "freeze"
  updatedAtUTC: string
}

interface AuditLogEntry {
  _id: string
  timestampUTC: string
  actor: string
  action: string
  prevState: string
  nextState: string
  nav: number
  liquidityPct: number
}

interface GovernanceLogEntry {
  _id: string
  timestampUTC: string
  action: string
  notes?: string
  multisig: { required: number; approvals: number }
}

export function useSystemData() {
  const [systemData, setSystemData] = useState<SystemData>({
    nav: 1001325059,
    liquidityPct: 32,
    state: "normal",
    updatedAtUTC: new Date().toISOString(),
  })
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [governanceLogs, setGovernanceLogs] = useState<GovernanceLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const eventSource = new EventSource("/api/stream")

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setSystemData({
          nav: data.nav,
          liquidityPct: data.liquidityPct,
          state: data.state,
          updatedAtUTC: data.updatedAtUTC,
        })
        setLoading(false)
      } catch (err) {
        console.error("SSE parse error:", err)
      }
    }

    eventSource.onerror = () => {
      console.warn("SSE connection error, will retry...")
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    try {
      const [auditResponse, governanceResponse] = await Promise.all([
        fetch("/api/audit-log"),
        fetch("/api/governance-log"),
      ])

      if (auditResponse.ok) {
        const auditData = await auditResponse.json()
        setAuditLog(auditData)
      }

      if (governanceResponse.ok) {
        const governanceData = await governanceResponse.json()
        setGovernanceLogs(governanceData)
      }
    } catch (err) {
      console.error("Error fetching logs:", err)
    }
  }, [])

  // Initial log fetch
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const triggerCyberEvent = useCallback(async () => {
    try {
      const response = await fetch("/api/event/trigger-cyber", { method: "POST" })
      if (!response.ok) throw new Error("Failed to trigger cyber event")
      await fetchLogs() // Refresh logs after event
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [fetchLogs])

  const triggerLiquidityFreeze = useCallback(async () => {
    try {
      const response = await fetch("/api/event/trigger-freeze", { method: "POST" })
      if (!response.ok) throw new Error("Failed to trigger liquidity freeze")
      await fetchLogs() // Refresh logs after event
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [fetchLogs])

  const resetToNormal = useCallback(async () => {
    try {
      const response = await fetch("/api/event/reset", { method: "POST" })
      if (!response.ok) throw new Error("Failed to reset to normal")
      await fetchLogs() // Refresh logs after event
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [fetchLogs])

  const generateProofPack = useCallback(async () => {
    try {
      const response = await fetch("/api/proofpack", { method: "POST" })
      if (!response.ok) throw new Error("Failed to generate proof pack")

      const blob = await response.blob()
      const filename =
        response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ||
        `proofpack-${new Date().toISOString().replace(/[:.-]/g, "")}.json`

      // Download the file
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [])

  return {
    systemState: {
      mode: systemData.state,
      nav: systemData.nav,
      liquidity: systemData.liquidityPct,
      timestamp: systemData.updatedAtUTC,
    },
    auditLog: auditLog.map((entry) => ({
      id: entry._id,
      event: `${entry.action} (${entry.prevState} → ${entry.nextState})`,
      details: `NAV: ${entry.nav.toLocaleString()}, Liquidity: ${entry.liquidityPct}%`,
      timestamp: entry.timestampUTC,
    })),
    governanceLogs: governanceLogs.map((entry) => ({
    id: entry._id,
    event: entry.action,
    details: entry.notes || `Multisig: ${entry.multisig?.approvals || 0}/${entry.multisig?.required || 0}`,
    timestamp: entry.timestampUTC,
  })),
    loading,
    error,
    actions: {
      triggerCyberEvent,
      triggerLiquidityFreeze,
      resetToNormal,
      generateProofPack,
      refresh: fetchLogs,
    },
  }
}
