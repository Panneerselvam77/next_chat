import api from "@/lib/api/axios";
import type { Post } from "./posts.types";

export async function fetchFeedPosts(
  beforeId?: number,
  limit = 20,
  signal?: AbortSignal,
): Promise<Post[]> {
  const response = await api.get<Post[]>("/feed", {
    params: { before_id: beforeId, limit },
    signal,
  });

  return response.data;
}

export async function fetchPosts(
  limit = 100,
  signal?: AbortSignal,
): Promise<Post[]> {
  const response = await api.get<Post[]>("/posts", {
    params: { limit },
    signal,
  });

  return response.data;
}

export async function fetchPostById(
  postId: number,
  signal?: AbortSignal,
): Promise<Post> {
  const response = await api.get<Post>(`/posts/${postId}`, { signal });

  return response.data;
}

export async function searchPosts(
  query: string,
  signal?: AbortSignal,
): Promise<Post[]> {
  const posts = await fetchPosts(100, signal);
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return posts.filter(
    (post) =>
      post.content.toLocaleLowerCase().includes(normalizedQuery) ||
      post.author.username.toLocaleLowerCase().includes(normalizedQuery),
  );
}

export async function likePost(
  postId: number,
  liked: boolean,
  signal?: AbortSignal,
): Promise<{ liked: boolean }> {
  const response = liked
    ? await api.post<{ liked: boolean }>(`/posts/${postId}/like`, undefined, {
        signal,
      })
    : await api.delete<{ liked: boolean }>(`/posts/${postId}/like`, { signal });

  return response.data;
}

export async function createPost(content: string): Promise<Post> {
  const response = await api.post<Post>("/posts", { content });
  return response.data;
}

export async function updatePost(
  postId: number,
  content: string,
): Promise<Post> {
  const response = await api.patch<Post>(`/posts/${postId}`, { content });
  return response.data;
}

export async function deletePost(postId: number): Promise<void> {
  await api.delete(`/posts/${postId}`);
}
