import api from "@/lib/api/axios";
import type { User } from "./users.types";
import type { PostsResponse } from "@/features/post/posts.types";

export async function fetchUserById(
  userId: number,
  signal?: AbortSignal,
): Promise<User> {
  const response = await api.get<User>(`/users/${userId}`, {
    signal,
  });

  return response.data;
}

export async function fetchUserPosts(
  userId: number,
  skip = 0,
  limit = 10,
  signal?: AbortSignal,
): Promise<PostsResponse> {
  const response = await api.get<PostsResponse>(`/posts/user/${userId}`, {
    params: { skip, limit },
    signal,
  });

  return response.data;
}
