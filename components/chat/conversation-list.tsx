import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Conversation {
  id: string
  other_user: {
    id: string
    full_name: string
    avatar_url?: string
  }
  last_message?: {
    content: string
    created_at: string
    is_read: boolean
    sender_id: string
  }
  unread_count: number
}

interface ConversationListProps {
  conversations: Conversation[]
  currentUserId: string
}

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const initials = conversation.other_user.full_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()

        const isUnread =
          conversation.last_message &&
          !conversation.last_message.is_read &&
          conversation.last_message.sender_id !== currentUserId

        return (
          <Link key={conversation.id} href={`/messages/${conversation.other_user.id}`}>
            <Card
              className={`p-4 transition-all hover:shadow-md ${isUnread ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : ""}`}
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={conversation.other_user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-semibold truncate ${isUnread ? "text-blue-900 dark:text-blue-100" : ""}`}>
                      {conversation.other_user.full_name}
                    </h3>
                    {conversation.unread_count > 0 && (
                      <Badge className="bg-blue-600 text-white">{conversation.unread_count}</Badge>
                    )}
                  </div>
                  {conversation.last_message && (
                    <>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message.sender_id === currentUserId ? "You: " : ""}
                        {conversation.last_message.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
