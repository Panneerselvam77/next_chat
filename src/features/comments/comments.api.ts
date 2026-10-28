import api from "@/lib/api/axios";
import type { CommentsResponse } from "./comments.types";

export async function fetchPostComments(
  postId: number,
  signal?: AbortSignal,
): Promise<CommentsResponse> {
  const response = await api.get<CommentsResponse>(
    `/posts/${postId}/comments`,
    { signal },
  );

  return response.data;
}
