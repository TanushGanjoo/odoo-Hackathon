import type { Profile, UpdateProfileInput } from './types'

const mockProfile: Profile = {
  id: '1',
  name: 'Demo User',
  username: 'demo_user',
  bio: 'Exploring the world one trip at a time.',
  homeCity: 'Ahmedabad',
  homeCountry: 'India',
  interests: ['Adventure', 'Food', 'Photography'],
}

export async function getProfile(): Promise<Profile> {
  return mockProfile
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<Profile> {
  return {
    ...mockProfile,
    ...input,
  }
}
