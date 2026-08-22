export interface CommunityPost {
  id: string
  authorId: string
  authorName: string
  authorUsername: string
  authorAvatarUrl?: string
  content: string
  createdAt: string
  likes: number
  comments: number
}

export interface CreateCommunityPostInput {
  content: string
}