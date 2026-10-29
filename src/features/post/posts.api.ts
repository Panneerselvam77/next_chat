import api from "@/lib/api/axios";
import type { Post, PostsResponse } from "./posts.types";

export async function fetchPosts(
  skip = 0,
  limit = 10,
  signal?: AbortSignal,
): Promise<PostsResponse> {
  const response = await api.get<PostsResponse>("/posts", {
    params: { skip, limit },
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
  skip = 0,
  limit = 10,
  signal?: AbortSignal,
): Promise<PostsResponse> {
  const response = await api.get<PostsResponse>("/posts/search", {
    params: {
      q: query,
      skip,
      limit,
    },
    signal,
  });
  console.log("Search API response:", response.data);

  return response.data;
}

export async function likePost(
  postId: number,
  likes: number,
  signal?: AbortSignal,
): Promise<void> {
  await api.put(
    `/posts/${postId}`,
    {
      reactions: { likes },
    },
    { signal },
  );
}
