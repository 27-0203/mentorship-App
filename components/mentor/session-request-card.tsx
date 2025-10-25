"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock } from "lucide-react"
import type { Session } from "@/lib/types"
import { format } from "date-fns"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SessionRequestCardProps {
  session: Session
}

export function SessionRequestCard({ session }: SessionRequestCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const studentName = session.student?.full_name || "Unknown Student"
  const initials = studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const handleConfirm = async () => {
    setIsLoading(true)
    const { error } = await supabase
      .from("sessions")
      .update({
        status: "confirmed",
        meeting_link: `https://meet.example.com/${session.id}`,
      })
      .eq("id", session.id)

    if (!error) {
      router.refresh()
    }
    setIsLoading(false)
  }

  const handleCancel = async () => {
    setIsLoading(true)
    const { error } = await supabase.from("sessions").update({ status: "cancelled" }).eq("id", session.id)

    if (!error) {
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={session.student?.avatar_url || "/placeholder.svg"} alt={studentName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{session.title}</h3>
              <p className="text-sm text-muted-foreground">with {studentName}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            {session.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(session.scheduled_at), "PPP")}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(session.scheduled_at), "p")} ({session.duration_minutes} min)
            </span>
          </div>
        </div>
        {session.description && <p className="mt-3 text-sm text-muted-foreground">{session.description}</p>}
        {session.status === "pending" && (
          <div className="mt-4 flex gap-2">
            <Button onClick={handleConfirm} disabled={isLoading} className="flex-1" size="sm">
              Confirm
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="outline"
              className="flex-1 bg-transparent"
              size="sm"
            >
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
