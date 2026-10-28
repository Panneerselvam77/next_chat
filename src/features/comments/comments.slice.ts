import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPostComments } from "./comments.api";
import type { Comment, CommentsState } from "./comments.types";

export const getPostComments = createAsyncThunk<
  Comment[],
  number,
  { rejectValue: string }
>("comments/fetchByPost", async (postId, { rejectWithValue, signal }) => {
  try {
    const response = await fetchPostComments(postId, signal);
    return response.comments;
  } catch {
    return rejectWithValue("Unable to load comments.");
  }
});

const initialState: CommentsState = {
  items: [],
  loading: false,
  error: null,
  currentPostId: null,
};

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearComments(state) {
      state.items = [];
      state.error = null;
      state.currentPostId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPostComments.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.currentPostId = action.meta.arg;
        state.items = [];
      })
      .addCase(getPostComments.fulfilled, (state, action) => {
        if (state.currentPostId !== action.meta.arg) return;

        state.loading = false;
        state.items = action.payload;
      })
      .addCase(getPostComments.rejected, (state, action) => {
        if (state.currentPostId !== action.meta.arg) return;

        state.loading = false;

        if (action.meta.aborted) return;

        state.error = action.payload ?? "Something went wrong.";
      });
  },
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;
