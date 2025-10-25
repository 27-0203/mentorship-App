import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ConversationList } from "@/components/chat/conversation-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function MentorMessagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all conversations (messages sent or received)
  const { data: sentMessages } = await supabase
    .from("messages")
    .select("receiver_id")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })

  const { data: receivedMessages } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false })

  // Get unique user IDs
  const userIds = new Set<string>()
  sentMessages?.forEach((msg) => userIds.add(msg.receiver_id))
  receivedMessages?.forEach((msg) => userIds.add(msg.sender_id))

  // Build conversations
  const conversations = await Promise.all(
    Array.from(userIds).map(async (userId) => {
      // Get other user profile
      const { data: otherUser } = await supabase.from("profiles").select("*").eq("id", userId).single()

      // Get last message
      const { data: lastMessage } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`,
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      // Get unread count
      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", userId)
        .eq("receiver_id", user.id)
        .eq("is_read", false)

      return {
        id: userId,
        other_user: otherUser,
        last_message: lastMessage,
        unread_count: unreadCount || 0,
      }
    }),
  )

  // Sort by last message time
  conversations.sort((a, b) => {
    const aTime = a.last_message ? new Date(a.last_message.created_at).getTime() : 0
    const bTime = b.last_message ? new Date(b.last_message.created_at).getTime() : 0
    return bTime - aTime
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/mentor/dashboard">
            <h1 className="text-2xl font-bold">MentorConnect</h1>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/mentor/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Chat with your students</p>
        </div>

        {conversations.length > 0 ? (
          <ConversationList conversations={conversations} currentUserId={user.id} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-lg font-semibold">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Messages from your students will appear here after they book sessions
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
