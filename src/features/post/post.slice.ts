import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  fetchFeedPosts,
  searchPosts as searchPostsApi,
  likePost as likePostApi,
} from "./posts.api";
import type { Post, PostsState } from "./posts.types";
import { getApiRequestErrorMessage } from "@/lib/api/errors";

interface FetchPostsArgs {
  beforeId?: number;
  limit?: number;
}

interface SearchPostsArgs {
  query: string;
}

export const getPosts = createAsyncThunk<
  { posts: Post[]; beforeId: number | null; hasMore: boolean },
  FetchPostsArgs | undefined,
  { rejectValue: string }
>("posts/fetchPosts", async (args, { rejectWithValue, signal }) => {
  const limit = args?.limit ?? 20;

  try {
    const posts = await fetchFeedPosts(args?.beforeId, limit, signal);
    return {
      posts,
      beforeId: posts.at(-1)?.id ?? args?.beforeId ?? null,
      hasMore: posts.length === limit,
    };
  } catch (error) {
    return rejectWithValue(
      getApiRequestErrorMessage(error, "Unable to load posts."),
    );
  }
});

export const searchPosts = createAsyncThunk<
  Post[],
  SearchPostsArgs,
  { rejectValue: string }
>(
  "posts/searchPosts",
  async ({ query }, { rejectWithValue, signal }) => {
    try {
      return await searchPostsApi(query, signal);
    } catch (error) {
      return rejectWithValue(
        getApiRequestErrorMessage(error, "Unable to search posts."),
      );
    }
  },
);

interface ToggleLikeArgs {
  postId: number;
  liked: boolean;
  currentLikes: number;
  currentLiked: boolean;
}

export const togglePostLike = createAsyncThunk<
  { postId: number; liked: boolean },
  ToggleLikeArgs,
  { rejectValue: string }
>(
  "posts/toggleLike",
  async ({ postId, liked }, { rejectWithValue, signal }) => {
    try {
      const result = await likePostApi(postId, liked, signal);
      return { postId, liked: result.liked };
    } catch (error) {
      return rejectWithValue(
        getApiRequestErrorMessage(error, "Unable to update like."),
      );
    }
  },
);

const initialState: PostsState = {
  feedItems: [],
  feedBeforeId: null,
  feedHasMore: true,
  feedLoading: false,
  feedError: null,

  searchItems: [],
  searchQuery: "",
  searchLoading: false,
  searchError: null,
  searchRequestId: null,

  likeStates: {},
  likeCounts: {},
  likeLoadingIds: [],
  likeSnapshots: {},
  likeError: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPostsError(state) {
      state.feedError = null;
      state.searchError = null;
    },

    resetSearch(state) {
      state.searchItems = [];
      state.searchQuery = "";
      state.searchLoading = false;
      state.searchError = null;
      state.searchRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPosts.pending, (state) => {
        state.feedLoading = true;
        state.feedError = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.feedLoading = false;
        const { posts, beforeId, hasMore } = action.payload;
        const isFirstPage = action.meta.arg?.beforeId === undefined;

        if (isFirstPage) {
          state.feedItems = posts;
        } else {
          const existingIds = new Set(state.feedItems.map((post) => post.id));
          state.feedItems.push(
            ...posts.filter((post) => !existingIds.has(post.id)),
          );
        }

        for (const post of posts) {
          state.likeStates[post.id] = post.liked_by_me;
          state.likeCounts[post.id] = post.likes_count;
        }

        state.feedBeforeId = beforeId;
        state.feedHasMore = hasMore;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.feedLoading = false;
        if (action.meta.aborted) return;
        state.feedError =
          action.payload ?? action.error.message ?? "Unable to load posts.";
      })
      .addCase(searchPosts.pending, (state, action) => {
        state.searchQuery = action.meta.arg.query;
        state.searchRequestId = action.meta.requestId;
        state.searchLoading = true;
        state.searchError = null;
        state.searchItems = [];
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return;

        state.searchLoading = false;
        state.searchItems = action.payload;
        for (const post of action.payload) {
          state.likeStates[post.id] = post.liked_by_me;
          state.likeCounts[post.id] = post.likes_count;
        }
      })
      .addCase(searchPosts.rejected, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return;
        state.searchLoading = false;
        if (action.meta.aborted) return;
        state.searchError = action.payload ?? "Unable to search posts.";
      })
      .addCase(togglePostLike.pending, (state, action) => {
        const { postId } = action.meta.arg;
        if (state.likeLoadingIds.includes(postId)) return;
        state.likeError = null;

        const post =
          state.feedItems.find((item) => item.id === postId) ??
          state.searchItems.find((item) => item.id === postId);

        const liked =
          state.likeStates[postId] ??
          post?.liked_by_me ??
          action.meta.arg.currentLiked;
        const likes = state.likeCounts[postId] ?? post?.likes_count ?? action.meta.arg.currentLikes;
        state.likeSnapshots[postId] = {
          likes,
          liked,
        };
        state.likeLoadingIds.push(postId);

        const nextLiked = action.meta.arg.liked;
        const nextLikes = Math.max(
          0,
          likes + (nextLiked === liked ? 0 : nextLiked ? 1 : -1),
        );
        state.likeStates[postId] = nextLiked;
        state.likeCounts[postId] = nextLikes;
        for (const item of [...state.feedItems, ...state.searchItems]) {
          if (item.id === postId) {
            item.likes_count = nextLikes;
            item.liked_by_me = nextLiked;
          }
        }
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;
        const snapshot = state.likeSnapshots[postId];
        const initialLiked = snapshot?.liked ?? !liked;
        const adjustment = liked === initialLiked ? 0 : liked ? 1 : -1;
        const nextLikes = Math.max(0, (snapshot?.likes ?? 0) + adjustment);

        state.likeStates[postId] = liked;
        state.likeCounts[postId] = nextLikes;
        for (const item of [...state.feedItems, ...state.searchItems]) {
          if (item.id === postId) {
            item.likes_count = nextLikes;
            item.liked_by_me = liked;
          }
        }

        state.likeLoadingIds = state.likeLoadingIds.filter(
          (id) => id !== postId,
        );
        delete state.likeSnapshots[postId];
        state.likeError = null;
      })
      .addCase(togglePostLike.rejected, (state, action) => {
        const { postId } = action.meta.arg;
        const snapshot = state.likeSnapshots[postId];

        if (snapshot) {
          state.likeStates[postId] = snapshot.liked;
          state.likeCounts[postId] = snapshot.likes;
          for (const item of [...state.feedItems, ...state.searchItems]) {
            if (item.id === postId) {
              item.likes_count = snapshot.likes;
              item.liked_by_me = snapshot.liked;
            }
          }
          delete state.likeSnapshots[postId];
        }

        state.likeLoadingIds = state.likeLoadingIds.filter(
          (id) => id !== postId,
        );
        state.likeError = action.payload ?? "Unable to update like.";
      });
  },
});

export const { clearPostsError, resetSearch } = postsSlice.actions;
export default postsSlice.reducer;
