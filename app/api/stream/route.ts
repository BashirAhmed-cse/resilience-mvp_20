import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const sendUpdate = async () => {
        try {
          const db = await getDatabase()
          const collection = db.collection("system_states")

          const latestState =
            (await collection.findOne({ _id: "singleton" })) ||
            (await collection.findOne({}, { sort: { updatedAtUTC: -1 } }))

          if (latestState) {
            const data = {
              nav: latestState.nav,
              liquidityPct: latestState.liquidityPct,
              state: latestState.state,
              updatedAtUTC: latestState.updatedAtUTC || new Date().toISOString(),
            }

            const message = `data: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(message))
          }
        } catch (error) {
          console.error("SSE error:", error)
        }
      }

      // Send initial data
      sendUpdate()

      // Send updates every 1 second
      const interval = setInterval(sendUpdate, 1000)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
