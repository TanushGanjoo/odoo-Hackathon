import type { Profile } from '../../profile/types'
interface ProfileCardProps {
  profile: Profile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <article>
      {profile.avatarUrl && (
        <img
          src={profile.avatarUrl}
          alt={`${profile.name}'s avatar`}
          width={96}
          height={96}
        />
      )}

      <h2>{profile.name}</h2>
      <p>@{profile.username}</p>

      {profile.bio && <p>{profile.bio}</p>}

      {(profile.homeCity || profile.homeCountry) && (
        <p>
          {[profile.homeCity, profile.homeCountry].filter(Boolean).join(', ')}
        </p>
      )}

      {profile.interests.length > 0 && (
        <div>
          <h3>Interests</h3>
          <ul>
            {profile.interests.map((interest) => (
              <li key={interest}>{interest}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}