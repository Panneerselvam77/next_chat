import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { fetchPosts, searchPosts as searchPostsApi } from "./posts.api";
import type { Post, PostsState } from "./posts.types";

interface FetchPostsArgs {
  skip?: number;
  limit?: number;
}

interface SearchPostsArgs {
  query: string;
  skip?: number;
  limit?: number;
}

export const getPosts = createAsyncThunk<
  { posts: Post[]; total: number; skip: number; limit: number },
  FetchPostsArgs | undefined,
  { rejectValue: string }
>("posts/fetchPosts", async (args, { rejectWithValue, signal }) => {
  try {
    return await fetchPosts(args?.skip ?? 0, args?.limit ?? 10, signal);
  } catch {
    return rejectWithValue("Unable to load posts. Please try again.");
  }
});

export const searchPosts = createAsyncThunk<
  { posts: Post[]; total: number; skip: number; limit: number },
  SearchPostsArgs,
  { rejectValue: string }
>(
  "posts/searchPosts",
  async ({ query, skip = 0, limit = 10 }, { rejectWithValue, signal }) => {
    try {
      return await searchPostsApi(query, skip, limit, signal);
    } catch {
      return rejectWithValue("Unable to search posts. Please try again.");
    }
  },
);

const initialState: PostsState = {
  feedItems: [],
  feedTotal: 0,
  feedSkip: 0,
  feedLoading: false,
  feedError: null,

  searchItems: [],
  searchTotal: 0,
  searchSkip: 0,
  searchQuery: "",
  searchLoading: false,
  searchError: null,
  searchRequestId: null,

  limit: 10,
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
      state.searchTotal = 0;
      state.searchSkip = 0;
      state.searchQuery = "";
      state.searchLoading = false;
      state.searchError = null;
      state.searchRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Feed
      .addCase(getPosts.pending, (state) => {
        state.feedLoading = true;
        state.feedError = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.feedLoading = false;
        state.feedItems = action.payload.posts;
        state.feedTotal = action.payload.total;
        state.feedSkip = action.payload.skip;
        state.limit = action.payload.limit;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.feedLoading = false;

        if (action.meta.aborted) return;

        state.feedError =
          action.payload ?? action.error.message ?? "Something went wrong.";
      })

      // Search
      .addCase(searchPosts.pending, (state, action) => {
        state.searchQuery = action.meta.arg.query;
        state.searchRequestId = action.meta.requestId;
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return;

        state.searchLoading = false;
        state.searchItems = action.payload.posts;
        state.searchTotal = action.payload.total;
        state.searchSkip = action.payload.skip;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        if (state.searchRequestId !== action.meta.requestId) return;

        state.searchLoading = false;

        if (action.meta.aborted) return;

        state.searchError = action.payload ?? "Unable to search posts.";
      });
  },
});

export const { clearPostsError, resetSearch } = postsSlice.actions;
export default postsSlice.reducer;
