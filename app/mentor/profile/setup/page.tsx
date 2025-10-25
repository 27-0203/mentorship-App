"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

export default function MentorProfileSetupPage() {
  const [bio, setBio] = useState("")
  const [expertise, setExpertise] = useState<string[]>([])
  const [currentSkill, setCurrentSkill] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addSkill = () => {
    if (currentSkill.trim() && !expertise.includes(currentSkill.trim())) {
      setExpertise([...expertise, currentSkill.trim()])
      setCurrentSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setExpertise(expertise.filter((s) => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Update profile bio
      const { error: profileError } = await supabase.from("profiles").update({ bio }).eq("id", user.id)

      if (profileError) throw profileError

      // Create mentor profile
      const { error: mentorError } = await supabase.from("mentor_profiles").insert({
        id: user.id,
        expertise,
        hourly_rate: hourlyRate ? Number.parseFloat(hourlyRate) : null,
        years_of_experience: yearsOfExperience ? Number.parseInt(yearsOfExperience) : null,
        is_available: true,
      })

      if (mentorError) throw mentorError

      router.push("/mentor/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">MentorConnect</h1>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Mentor Profile</CardTitle>
            <CardDescription>Help students learn more about you and your expertise</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell students about yourself, your background, and what you can help them with..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expertise">Areas of Expertise</Label>
                <div className="flex gap-2">
                  <Input
                    id="expertise"
                    placeholder="e.g., React, Python, Data Science"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                {expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {expertise.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="ml-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="50"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty if offering free sessions</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    placeholder="5"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading || expertise.length === 0}>
                {isLoading ? "Creating Profile..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
