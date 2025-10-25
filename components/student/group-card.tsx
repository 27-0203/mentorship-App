import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import type { Group } from "@/lib/types"

interface GroupCardProps {
  group: Group
  isMember?: boolean
}

export function GroupCard({ group, isMember }: GroupCardProps) {
  const mentorName = group.mentor?.profile?.full_name || "Unknown Mentor"
  const initials = mentorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{group.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={group.mentor?.profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span>Led by {mentorName}</span>
            </div>
          </div>
          {isMember && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Joined
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {group.description || "No description available"}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {group.member_count || 0}/{group.max_participants} members
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={isMember || (group.member_count || 0) >= group.max_participants}>
          {isMember ? "Already Joined" : (group.member_count || 0) >= group.max_participants ? "Full" : "Join Group"}
        </Button>
      </CardFooter>
    </Card>
  )
}
