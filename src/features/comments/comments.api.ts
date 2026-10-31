import api from "@/lib/api/axios";
import type { Comment } from "./comments.types";

export async function fetchPostComments(
  postId: number,
  signal?: AbortSignal,
  limit = 20,
  beforeId?: number,
): Promise<Comment[]> {
  const response = await api.get<Comment[]>(
    `/posts/${postId}/comments`,
    { params: { limit, before_id: beforeId }, signal },
  );

  return response.data;
}

export async function createPostComment(
  postId: number,
  body: string,
): Promise<Comment> {
  const response = await api.post<Comment>(`/posts/${postId}/comments`, {
    body,
  });

  return response.data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/posts/comments/${commentId}`);
}
