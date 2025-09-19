"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Building2,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Play,
  Download,
  Zap,
  Snowflake,
} from "lucide-react"
import { useSystemData } from "@/hooks/use-system-data"

export default function ResilienceDashboard() {
  const { systemState, auditLog, governanceLogs, loading, error, actions } = useSystemData()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      timeZone: "UTC",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const isInCrisis = systemState.mode !== "normal"
  const themeColors = {
    bg: isInCrisis ? "bg-red-50" : "bg-green-50",
    cardBorder: isInCrisis ? "border-red-200" : "border-green-200",
    cardBg: isInCrisis ? "bg-white/70" : "bg-white/70",
    liveBadge: isInCrisis ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800",
    liveDot: isInCrisis ? "bg-red-600" : "bg-green-600",
    statusBadge: isInCrisis ? "bg-red-100 border-red-200" : "bg-green-100 border-green-200",
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${themeColors.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading ResilienceOS+...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-800">Error: {error}</p>
          <Button onClick={() => actions.refresh()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeColors.bg} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ResilienceOS+</h1>
            <p className="text-sm text-gray-600">Sovereign Dashboard — Demo</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <div className="text-gray-600 mb-1">NAV</div>
              <div className="font-semibold">{formatCurrency(systemState.nav)}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-600 mb-1">Liquidity</div>
              <div className="font-semibold">{systemState.liquidity}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={`${themeColors.liveBadge} flex items-center gap-1 px-3 py-1`}>
              <div className={`w-2 h-2 ${themeColors.liveDot} rounded-full animate-pulse`} />
              LIVE
            </Badge>
            <Play className="h-4 w-4 text-gray-600" />
          </div>

          <Badge variant="outline" className={`px-3 py-1 ${themeColors.statusBadge}`}>
            {systemState.mode === "normal"
              ? "Normal Operations"
              : systemState.mode === "cyber"
                ? "Cyber Crisis"
                : "Liquidity Freeze"}
          </Badge>

          <div className="text-right">
            <div className="text-sm text-gray-600">Live Status</div>
            <div className="font-mono text-sm font-semibold">{formatTime(currentTime)} UTC</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total NAV */}
        <Card className={`${themeColors.cardBg} ${themeColors.cardBorder}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              Total NAV
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(systemState.nav)}</div>
            <p className="text-sm text-gray-600">Net Asset Value</p>
          </CardContent>
        </Card>

        {/* Liquidity Sleeve */}
        <Card className={`${themeColors.cardBg} ${themeColors.cardBorder}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              Liquidity Sleeve %
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{systemState.liquidity}%</div>
            <p className="text-sm text-blue-600">Available Liquidity</p>
          </CardContent>
        </Card>

        {/* Governance Status */}
        <Card className={`${themeColors.cardBg} ${themeColors.cardBorder}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              Governance Status
              <Shield className="h-4 w-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-gray-900 mb-1">Normal (3-of-5 armed)</div>
            <p className="text-sm text-gray-600">Multi-signature governance protocol</p>
          </CardContent>
        </Card>
      </div>

      {/* Facilities Status */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className={`${themeColors.cardBg} ${themeColors.cardBorder}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              Facilities Status
              <Building2 className="h-4 w-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-gray-900 mb-1">A: Active | B: Standby</div>
            <p className="text-sm text-gray-600">Credit facilities and backup systems</p>
          </CardContent>
        </Card>
      </div>

      {/* System Notes */}
      <Card className={`${themeColors.cardBg} ${themeColors.cardBorder} mb-8`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              {systemState.mode === "normal"
                ? "All systems nominal; sleeves within 25—35%; Facility B on standby."
                : systemState.mode === "cyber"
                  ? "CYBER CRISIS ACTIVE: Emergency protocols engaged, NAV protection measures active."
                  : "LIQUIDITY FREEZE: Emergency liquidity constraints in effect, monitoring active."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Governance Logs */}
      <Card className={`${themeColors.cardBg} ${themeColors.cardBorder} mb-8`}>
        <CardHeader>
          <CardTitle className="text-gray-900">Governance Logs</CardTitle>
          <p className="text-sm text-gray-600">Real-time audit trail of all system state changes</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {governanceLogs.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">{entry.event}</div>
                    <div className="text-sm text-gray-600">{entry.details}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-mono">
                  {new Date(entry.timestamp).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card className={`${themeColors.cardBg} ${themeColors.cardBorder} mb-8`}>
        <CardHeader>
          <CardTitle className="text-gray-900">Audit Log</CardTitle>
          <p className="text-sm text-gray-600">Complete system event history</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLog.slice(0, 3).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">{entry.event}</div>
                    <div className="text-sm text-gray-600">{entry.details}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-mono">
                  {new Date(entry.timestamp).toLocaleDateString("en-US", {
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  {new Date(entry.timestamp).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crisis Management Controls */}
      <Card className={`${themeColors.cardBg} ${themeColors.cardBorder}`}>
        <CardHeader>
          <CardTitle className="text-gray-900">Crisis Management Controls</CardTitle>
          <p className="text-sm text-gray-600">Trigger emergency protocols and stress test scenarios</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Button
              variant="outline"
              className="h-16 flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 bg-transparent"
              onClick={actions.triggerCyberEvent}
              disabled={systemState.mode !== "normal"}
            >
              <Zap className="h-5 w-5" />
              Trigger Cyber Event
            </Button>

            <Button
              variant="outline"
              className="h-16 flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 bg-transparent"
              onClick={actions.triggerLiquidityFreeze}
              disabled={systemState.mode !== "normal"}
            >
              <Snowflake className="h-5 w-5" />
              Trigger Liquidity Freeze
            </Button>

            <Button
              variant="outline"
              className="h-16 flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 bg-transparent"
              onClick={actions.generateProofPack}
            >
              <Download className="h-5 w-5" />
              Generate Proof Pack
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 flex items-center gap-2"
              onClick={actions.resetToNormal}
              disabled={systemState.mode === "normal"}
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Normal Operations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
