import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Draft } from "immer";

import {
  createPost as createPostApi,
  deletePost as deletePostApi,
  fetchFeedPosts,
  searchPosts as searchPostsApi,
  likePost as likePostApi,
  updatePost as updatePostApi,
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

function addPostToVisibleLists(state: Draft<PostsState>, post: Post) {
  state.feedItems = [
    post,
    ...state.feedItems.filter((item) => item.id !== post.id),
  ];

  const query = state.searchQuery.toLocaleLowerCase();
  if (
    query &&
    (post.content.toLocaleLowerCase().includes(query) ||
      post.author.username.toLocaleLowerCase().includes(query))
  ) {
    state.searchItems = [
      post,
      ...state.searchItems.filter((item) => item.id !== post.id),
    ];
  }

  state.likeStates[post.id] = post.liked_by_me;
  state.likeCounts[post.id] = post.likes_count;
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

export const createPost = createAsyncThunk<
  Post,
  string,
  { rejectValue: string }
>("posts/createPost", async (content, { rejectWithValue }) => {
  try {
    return await createPostApi(content);
  } catch (error) {
    return rejectWithValue(
      getApiRequestErrorMessage(error, "Unable to create post."),
    );
  }
});

export const updatePost = createAsyncThunk<
  Post,
  { postId: number; content: string },
  { rejectValue: string }
>("posts/updatePost", async ({ postId, content }, { rejectWithValue }) => {
  try {
    return await updatePostApi(postId, content);
  } catch (error) {
    return rejectWithValue(
      getApiRequestErrorMessage(error, "Unable to update post."),
    );
  }
});

export const deletePost = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("posts/deletePost", async (postId, { rejectWithValue }) => {
  try {
    await deletePostApi(postId);
    return postId;
  } catch (error) {
    return rejectWithValue(
      getApiRequestErrorMessage(error, "Unable to delete post."),
    );
  }
});

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
  feedVersion: 0,
  feedRequestVersions: {},

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
    ensurePostVisible(state, action: { payload: Post }) {
      addPostToVisibleLists(state, action.payload);
    },

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
      .addCase(getPosts.pending, (state, action) => {
        state.feedLoading = true;
        state.feedError = null;
        state.feedRequestVersions[action.meta.requestId] = state.feedVersion;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        const requestVersion =
          state.feedRequestVersions[action.meta.requestId];
        delete state.feedRequestVersions[action.meta.requestId];
        state.feedLoading = false;
        if (requestVersion !== state.feedVersion) return;

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
        const requestVersion =
          state.feedRequestVersions[action.meta.requestId];
        delete state.feedRequestVersions[action.meta.requestId];
        state.feedLoading = false;
        if (action.meta.aborted) return;
        if (requestVersion !== state.feedVersion) return;
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
      .addCase(createPost.fulfilled, (state, action) => {
        state.feedVersion += 1;
        addPostToVisibleLists(state, action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const post = action.payload;
        for (const item of [...state.feedItems, ...state.searchItems]) {
          if (item.id === post.id) {
            item.content = post.content;
            item.updated_at = post.updated_at;
          }
        }
        if (state.searchQuery) {
          const query = state.searchQuery.toLocaleLowerCase();
          state.searchItems = state.searchItems.filter(
            (item) =>
              item.content.toLocaleLowerCase().includes(query) ||
              item.author.username.toLocaleLowerCase().includes(query),
          );
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.feedVersion += 1;
        state.feedItems = state.feedItems.filter((post) => post.id !== postId);
        state.searchItems = state.searchItems.filter(
          (post) => post.id !== postId,
        );
        delete state.likeStates[postId];
        delete state.likeCounts[postId];
        delete state.likeSnapshots[postId];
        state.likeLoadingIds = state.likeLoadingIds.filter(
          (id) => id !== postId,
        );
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

export const {
  clearPostsError,
  ensurePostVisible,
  resetSearch,
} = postsSlice.actions;
export default postsSlice.reducer;
