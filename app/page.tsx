import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Video, Calendar } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-stone-900 dark:via-neutral-800 dark:to-zinc-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 dark:text-white md:text-6xl">
            Welcome to{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Student Affairs
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Connect with experienced mentors or share your expertise. Build
            meaningful relationships and accelerate your learning journey.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg bg-transparent"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Expert Mentors</h3>
              <p className="text-muted-foreground">
                Connect with experienced professionals in your field of interest
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Easy Scheduling</h3>
              <p className="text-muted-foreground">
                Book sessions that fit your schedule with our intuitive calendar
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Video className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Video Sessions</h3>
              <p className="text-muted-foreground">
                Meet face-to-face with integrated video calling capabilities
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:shadow-lg">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Group Learning</h3>
              <p className="text-muted-foreground">
                Join group sessions and clubs to learn with peers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <Card className="border-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="py-12">
              <h2 className="mb-4 text-3xl font-bold">
                Ready to Start Your Journey?
              </h2>
              <p className="mb-6 text-lg text-blue-100">
                Join thousands of students and mentors already learning together
              </p>
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link href="/auth/sign-up">Create Free Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
