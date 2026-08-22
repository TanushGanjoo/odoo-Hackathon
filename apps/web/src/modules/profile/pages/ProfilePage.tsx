import { useEffect, useState } from 'react'
import { getProfile } from '../api'
import type { Profile } from '../types'
import { ProfileCard } from '../components/ProfileCard'

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile()
        setProfile(data)
      } catch {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return <p>Loading profile...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!profile) {
    return <p>No profile found.</p>
  }

  return (
    <main>
      <h1>My Profile</h1>
      <ProfileCard profile={profile} />
    </main>
  )
}