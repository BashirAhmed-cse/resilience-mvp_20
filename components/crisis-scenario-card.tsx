"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, TrendingDown, Droplets } from "lucide-react"
import type { CrisisScenario } from "@/lib/crisis-scenarios"

interface CrisisScenarioCardProps {
  scenario: CrisisScenario
  onTrigger: () => void
  disabled: boolean
}

export function CrisisScenarioCard({ scenario, onTrigger, disabled }: CrisisScenarioCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-yellow-100 text-yellow-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "high":
        return "bg-red-100 text-red-800"
      case "critical":
        return "bg-red-200 text-red-900"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getImpactPercentage = (impact: number) => {
    return Math.round((1 - impact) * 100)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{scenario.name}</CardTitle>
          <Badge className={getSeverityColor(scenario.severity)}>{scenario.severity.toUpperCase()}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{scenario.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Impact Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <div>
              <div className="text-sm font-medium">NAV Impact</div>
              <div className="text-lg font-bold text-red-600">-{getImpactPercentage(scenario.navImpact)}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Liquidity Target</div>
              <div className="text-lg font-bold text-blue-600">{scenario.liquidityTarget}%</div>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            Est. Duration: {Math.floor(scenario.duration / 60)}h {scenario.duration % 60}m
          </span>
        </div>

        {/* Triggers */}
        <div>
          <div className="text-sm font-medium mb-2">Key Triggers:</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            {scenario.triggers.slice(0, 2).map((trigger, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-red-500 mt-0.5">•</span>
                {trigger}
              </li>
            ))}
          </ul>
        </div>

        {/* Trigger Button */}
        <Button
          onClick={onTrigger}
          disabled={disabled}
          variant="outline"
          className="w-full mt-4 border-red-200 hover:bg-red-50 bg-transparent"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Trigger Scenario
        </Button>
      </CardContent>
    </Card>
  )
}
