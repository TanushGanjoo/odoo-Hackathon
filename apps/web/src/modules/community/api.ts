import type { CommunityPost, CreateCommunityPostInput } from './types'

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    authorId: '1',
    authorName: 'Demo User',
    authorUsername: 'demo_user',
    content: 'Just planned my next adventure. Can’t wait to explore somewhere new!',
    createdAt: new Date().toISOString(),
    likes: 12,
    comments: 3,
  },
]

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  return mockPosts
}

export async function createCommunityPost(
  input: CreateCommunityPostInput,
): Promise<CommunityPost> {
  return {
    id: String(mockPosts.length + 1),
    authorId: '1',
    authorName: 'Demo User',
    authorUsername: 'demo_user',
    content: input.content,
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: 0,
  }
}