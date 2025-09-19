"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Users, CheckCircle, XCircle, AlertTriangle, Hash } from "lucide-react"
import type { GovernanceLogEntry } from "@/lib/types"

export function GovernanceLogsPanel() {
  const [governanceLogs, setGovernanceLogs] = useState<GovernanceLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGovernanceLogs()
  }, [])

  const fetchGovernanceLogs = async () => {
    try {
      const response = await fetch("/api/governance")
      if (response.ok) {
        const data = await response.json()
        setGovernanceLogs(data)
      }
    } catch (error) {
      console.error("Failed to fetch governance logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "approval":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejection":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "override":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "multisig":
        return <Users className="h-4 w-4 text-blue-600" />
      case "compliance":
        return <Shield className="h-4 w-4 text-purple-600" />
      default:
        return <Lock className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      approval: "bg-green-100 text-green-800",
      rejection: "bg-red-100 text-red-800",
      override: "bg-orange-100 text-orange-800",
      multisig: "bg-blue-100 text-blue-800",
      compliance: "bg-purple-100 text-purple-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Governance Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Governance Logs
        </CardTitle>
        <p className="text-sm text-muted-foreground">Immutable record of all governance actions and approvals</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {governanceLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No governance actions recorded yet</p>
            </div>
          ) : (
            governanceLogs.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 bg-white/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(entry.type)}
                    <span className="font-medium">{entry.action}</span>
                    <Badge className={getTypeBadge(entry.type)}>{entry.type.toUpperCase()}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  <strong>Initiator:</strong> {entry.initiator}
                </div>

                {entry.approvers.length > 0 && (
                  <div className="text-sm text-muted-foreground mb-2">
                    <strong>Approvers:</strong> {entry.approvers.join(", ")}
                  </div>
                )}

                <div className="text-sm mb-3">{entry.details}</div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span className="font-mono">{entry.hash.substring(0, 16)}...</span>
                  <Lock className="h-3 w-3" />
                  <span>Immutable</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={fetchGovernanceLogs} className="w-full bg-transparent">
            Refresh Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
