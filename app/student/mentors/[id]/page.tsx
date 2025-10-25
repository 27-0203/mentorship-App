import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Clock, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"

export default async function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get mentor profile
  const { data: mentor } = await supabase
    .from("mentor_profiles")
    .select(
      `
      *,
      profile:profiles(*)
    `,
    )
    .eq("id", id)
    .single()

  if (!mentor) {
    notFound()
  }

  // Get mentor's reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      student:profiles(full_name, avatar_url)
    `,
    )
    .eq("mentor_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get mentor's availability
  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("mentor_id", id)
    .order("day_of_week", { ascending: true })

  const initials = mentor.profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/student/dashboard">
            <h1 className="text-2xl font-bold">MentorConnect</h1>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/student/mentors">Back to Mentors</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Profile */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={mentor.profile?.avatar_url || "/placeholder.svg"}
                      alt={mentor.profile?.full_name}
                    />
                    <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="mb-2 text-3xl font-bold">{mentor.profile?.full_name}</h1>
                    <div className="mb-4 flex flex-wrap items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{mentor.rating.toFixed(1)}</span>
                        <span className="text-sm">({mentor.total_sessions} sessions)</span>
                      </div>
                      {mentor.years_of_experience && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-5 w-5" />
                          <span>{mentor.years_of_experience} years experience</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-5 w-5" />
                        <span className="font-semibold">
                          {mentor.hourly_rate ? `$${mentor.hourly_rate}/hr` : "Free"}
                        </span>
                      </div>
                    </div>
                    {!mentor.is_available && (
                      <Badge variant="secondary" className="mb-4 bg-gray-200 dark:bg-gray-700">
                        Currently Unavailable
                      </Badge>
                    )}
                    <p className="text-muted-foreground">{mentor.profile?.bio || "No bio available"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expertise */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.student?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {review.student?.full_name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{review.student?.full_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Session */}
            <Card>
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" size="lg" disabled={!mentor.is_available}>
                  <Link href={`/student/book/${id}`}>
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Session
                  </Link>
                </Button>
                {!mentor.is_available && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">This mentor is currently unavailable</p>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                {availability && availability.length > 0 ? (
                  <div className="space-y-2 text-sm">
                    {availability.map((slot) => (
                      <div key={slot.id} className="flex justify-between">
                        <span className="font-medium">{daysOfWeek[slot.day_of_week]}</span>
                        <span className="text-muted-foreground">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No availability set</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
