"use client"

import type React from "react"

import { useState, useEffect, useRef, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageBubble } from "@/components/chat/message-bubble"
import { Send, ArrowLeft, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Message } from "@/lib/types"

export default function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [otherUser, setOtherUser] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
    const interval = setInterval(loadMessages, 3000) // Poll for new messages every 3 seconds
    return () => clearInterval(interval)
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadData = async () => {
    await Promise.all([loadCurrentUser(), loadOtherUser(), loadMessages()])
  }

  const loadCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setCurrentUser(data)
    }
  }

  const loadOtherUser = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
    setOtherUser(data)
  }

  const loadMessages = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:profiles!messages_sender_id_fkey(*),
        receiver:profiles!messages_receiver_id_fkey(*)
      `,
      )
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
      .order("created_at", { ascending: true })

    if (data) {
      setMessages(data)

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", userId)
        .eq("receiver_id", user.id)
        .eq("is_read", false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return

    setIsLoading(true)

    const { error } = await supabase.from("messages").insert({
      sender_id: currentUser.id,
      receiver_id: userId,
      content: newMessage.trim(),
    })

    if (!error) {
      setNewMessage("")
      await loadMessages()
    }

    setIsLoading(false)
  }

  const initials = otherUser?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {otherUser && (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={otherUser.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{otherUser.full_name}</h2>
                  <p className="text-xs text-muted-foreground capitalize">{otherUser.role}</p>
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Video className="mr-2 h-4 w-4" />
            Start Video Call
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} isOwn={message.sender_id === currentUser?.id} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
