import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/auth.slice";
import postsReducer from "@/features/post/post.slice";
import commendsReducer from "@/features/comments/comments.slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      posts: postsReducer,
      comments: commendsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
