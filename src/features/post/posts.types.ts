export interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
  userId: number;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  skip: number;
  limit: number;
}

export interface PostsState {
  // Normal feed
  feedItems: Post[];
  feedTotal: number;
  feedSkip: number;
  feedLoading: boolean;
  feedError: string | null;

  // Search results
  searchItems: Post[];
  searchTotal: number;
  searchSkip: number;
  searchQuery: string;
  searchLoading: boolean;
  searchError: string | null;
  searchRequestId: string | null;
  limit: number;
}

export interface Comment {
  id: number;
  body: string;
  postId: number;
  likes: number;
  user: {
    id: number;
    username: string;
    fullName: string;
  };
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  skip: number;
  limit: number;
}
