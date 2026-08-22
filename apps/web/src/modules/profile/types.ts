export interface Profile {
  id: string
  name: string
  username: string
  bio: string
  avatarUrl?: string
  homeCity?: string
  homeCountry?: string
  interests: string[]
}

export interface UpdateProfileInput {
  name: string
  username: string
  bio: string
  homeCity?: string
  homeCountry?: string
  interests: string[]
}