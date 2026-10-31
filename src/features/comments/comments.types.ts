export interface Comment {
  id: number;
  body: string;
  created_at: string;
  author: {
    id: number;
    username: string;
  };
}

export interface CommentsState {
  items: Comment[];
  loading: boolean;
  error: string | null;
  currentPostId: number | null;
  adding: boolean;
  addError: string | null;
}
