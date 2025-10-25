import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Clock, DollarSign } from "lucide-react"
import type { MentorProfile } from "@/lib/types"
import Link from "next/link"

interface MentorCardProps {
  mentor: MentorProfile & { profile?: { full_name: string; avatar_url?: string; bio?: string } }
}

export function MentorCard({ mentor }: MentorCardProps) {
  const initials = mentor.profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={mentor.profile?.avatar_url || "/placeholder.svg"} alt={mentor.profile?.full_name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{mentor.profile?.full_name}</h3>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{mentor.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{mentor.total_sessions} sessions</span>
              </div>
            </div>
          </div>
          {!mentor.is_available && (
            <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700">
              Unavailable
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{mentor.profile?.bio || "No bio available"}</p>
        <div className="flex flex-wrap gap-2">
          {mentor.expertise.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
          {mentor.expertise.length > 4 && <Badge variant="outline">+{mentor.expertise.length - 4} more</Badge>}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-lg font-semibold">
          <DollarSign className="h-5 w-5" />
          <span>{mentor.hourly_rate ? `${mentor.hourly_rate}/hr` : "Free"}</span>
        </div>
        <Button asChild disabled={!mentor.is_available}>
          <Link href={`/student/mentors/${mentor.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
