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

export interface CommentsState {
  items: Comment[];
  loading: boolean;
  error: string | null;
  currentPostId: number | null;
}
