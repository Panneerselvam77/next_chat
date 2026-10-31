export interface Post {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    username: string;
  };
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

export interface PostsState {
  feedItems: Post[];
  feedBeforeId: number | null;
  feedHasMore: boolean;
  feedLoading: boolean;
  feedError: string | null;

  searchItems: Post[];
  searchQuery: string;
  searchLoading: boolean;
  searchError: string | null;
  searchRequestId: string | null;

  likeStates: Record<number, boolean>;
  likeCounts: Record<number, number>;
  likeLoadingIds: number[];
  likeSnapshots: Record<number, { likes: number; liked: boolean }>;
  likeError: string | null;
}
