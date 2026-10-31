import api from "@/lib/api/axios";
import type { User } from "./users.types";
import type { Post } from "@/features/post/posts.types";
import { fetchPosts } from "@/features/post/posts.api";

export interface FollowState {
  following: boolean;
}

export interface UserSummary {
  id: number;
  username: string;
}

export interface AccountAnalytics {
  posts_count: number;
  followers_count: number;
  following_count: number;
  likes_received: number;
  comments_received: number;
}

export interface UpdateMyProfile {
  username?: string;
  bio?: string | null;
}

export async function fetchUserByUsername(
  username: string,
  signal?: AbortSignal,
): Promise<User> {
  const response = await api.get<User>(
    `/users/${encodeURIComponent(username)}`,
    { signal },
  );

  return response.data;
}

export async function updateMyProfile(
  profile: UpdateMyProfile,
): Promise<User> {
  const response = await api.patch<User>("/users/me", profile);
  return response.data;
}

export async function followUser(username: string): Promise<FollowState> {
  const response = await api.post<FollowState>(
    `/users/${encodeURIComponent(username)}/follow`,
  );
  return response.data;
}

export async function unfollowUser(username: string): Promise<FollowState> {
  const response = await api.delete<FollowState>(
    `/users/${encodeURIComponent(username)}/follow`,
  );
  return response.data;
}

export async function fetchFollowers(
  limit = 20,
  beforeId?: number,
  signal?: AbortSignal,
): Promise<UserSummary[]> {
  const response = await api.get<UserSummary[]>("/users/me/followers", {
    params: { limit, before_id: beforeId },
    signal,
  });
  return response.data;
}

export async function fetchFollowing(
  limit = 20,
  beforeId?: number,
  signal?: AbortSignal,
): Promise<UserSummary[]> {
  const response = await api.get<UserSummary[]>("/users/me/following", {
    params: { limit, before_id: beforeId },
    signal,
  });
  return response.data;
}

export async function fetchUserPosts(
  userId: number,
  signal?: AbortSignal,
): Promise<Post[]> {
  const posts = await fetchPosts(100, signal);
  return posts.filter((post) => post.author.id === userId);
}

export async function fetchMyAnalytics(): Promise<AccountAnalytics> {
  const response = await api.get<AccountAnalytics>("/analytics/me");
  return response.data;
}
