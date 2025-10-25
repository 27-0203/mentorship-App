import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MentorCard } from "@/components/student/mentor-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Link from "next/link"

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; expertise?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Build query
  let query = supabase
    .from("mentor_profiles")
    .select(
      `
      *,
      profile:profiles(*)
    `,
    )
    .order("rating", { ascending: false })

  // Apply search filter
  if (params.search) {
    query = query.or(`profile.full_name.ilike.%${params.search}%,profile.bio.ilike.%${params.search}%`)
  }

  const { data: mentors } = await query

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/student/dashboard">
            <h1 className="text-2xl font-bold">MentorConnect</h1>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/student/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Find Your Mentor</h1>
          <p className="text-muted-foreground">Browse through our community of experienced mentors</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <form action="/student/mentors" method="get" className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by name or expertise..."
                className="pl-10"
                defaultValue={params.search}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Mentors Grid */}
        {mentors && mentors.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">No mentors found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
