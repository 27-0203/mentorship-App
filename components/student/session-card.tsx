import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Video } from "lucide-react"
import type { Session } from "@/lib/types"
import { format } from "date-fns"
import Link from "next/link"

interface SessionCardProps {
  session: Session
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function SessionCard({ session }: SessionCardProps) {
  const mentorName = session.mentor?.profile?.full_name || "Unknown Mentor"
  const initials = mentorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={session.mentor?.profile?.avatar_url || "/placeholder.svg"} alt={mentorName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{session.title}</h3>
              <p className="text-sm text-muted-foreground">with {mentorName}</p>
            </div>
          </div>
          <Badge className={statusColors[session.status]}>{session.status}</Badge>
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
        {session.status === "confirmed" && session.meeting_link && (
          <Button asChild className="mt-4 w-full" size="sm">
            <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
              <Video className="mr-2 h-4 w-4" />
              Join Meeting
            </a>
          </Button>
        )}
        {session.status === "pending" && (
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
              <Link href={`/student/sessions/${session.id}`}>View Details</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
