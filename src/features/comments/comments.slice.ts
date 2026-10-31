import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPostComments, createPostComment } from "./comments.api";
import type { Comment, CommentsState } from "./comments.types";
import { getApiRequestErrorMessage } from "@/lib/api/errors";

export const getPostComments = createAsyncThunk<
  Comment[],
  number,
  { rejectValue: string }
>("comments/fetchByPost", async (postId, { rejectWithValue, signal }) => {
  try {
    return await fetchPostComments(postId, signal);
  } catch (error) {
    return rejectWithValue(
      getApiRequestErrorMessage(error, "Unable to load comments."),
    );
  }
});

interface CreateCommentArgs {
  postId: number;
  body: string;
}

export const addPostComment = createAsyncThunk<
  { postId: number; comment: Comment },
  CreateCommentArgs,
  { rejectValue: string }
>("comments/add", async ({ postId, body }, { rejectWithValue }) => {
  try {
    const comment = await createPostComment(postId, body);
    return { postId, comment };
  } catch (error) {
    return rejectWithValue(
      getApiRequestErrorMessage(error, "Unable to add comment. Please try again."),
    );
  }
});

const initialState: CommentsState = {
  items: [],
  loading: false,
  error: null,
  currentPostId: null,
  adding: false,
  addError: null,
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
      })
      .addCase(addPostComment.pending, (state) => {
        state.adding = true;
        state.addError = null;
      })
      .addCase(addPostComment.fulfilled, (state, action) => {
        state.adding = false;

        // Avoid showing a new comment under a different post.
        if (state.currentPostId !== action.payload.postId) return;

        state.items.unshift(action.payload.comment);
      })
      .addCase(addPostComment.rejected, (state, action) => {
        state.adding = false;
        state.addError =
          action.payload ?? "Unable to add comment. Please try again.";
      });
  },
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;
