import { useEffect, useState } from 'react'
import { getCommunityPosts } from '../api'
import type { CommunityPost } from '../types'

export function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getCommunityPosts()
        setPosts(data)
      } catch (err) {
        console.error(err)
        setError('Unable to load the community right now.')
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  return (
    <main className="community-page">
      <div className="section-heading">
        <p className="eyebrow dark-eyebrow">
          <span className="eyebrow-dot" />
          COMMUNITY
        </p>

        <h1>Travel together</h1>

        <p>
          Discover stories, tips and inspiration from fellow
          travellers.
        </p>
      </div>

      {loading && (
        <div className="content-card">
          <p>Loading community...</p>
        </div>
      )}

      {error && (
        <div className="content-card error-card">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="content-card empty-card">
          <h2>No posts yet</h2>
          <p>
            The community is waiting for its first adventure.
          </p>
        </div>
      )}

      <section className="community-feed">
        {posts.map((post) => (
          <article className="community-post" key={post.id}>
            <div className="post-author">
              {post.authorAvatarUrl ? (
                <img
                  src={post.authorAvatarUrl}
                  alt=""
                  className="post-avatar"
                />
              ) : (
                <div className="post-avatar post-avatar-placeholder">
                  {post.authorName.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <strong>{post.authorName}</strong>
                <span>@{post.authorUsername}</span>
              </div>
            </div>

            <p className="post-content">{post.content}</p>

            <div className="post-meta">
              <span>♥ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}