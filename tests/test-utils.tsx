import type { PropsWithChildren, ReactElement } from "react";
import { act, render } from "@testing-library/react";
import { Provider } from "react-redux";
import type { AppStore } from "@/store/store";
import { makeStore } from "@/store/store";
import type { AuthUser } from "@/features/auth/auth.types";
import type { Post } from "@/features/post/posts.types";
import type { Comment } from "@/features/comments/comments.types";
import { login } from "@/features/auth/auth.slice";

export function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 7,
    username: "alex",
    email: "alex@example.com",
    bio: "Hello there",
    created_at: "2026-01-01T10:00:00",
    ...overrides,
  };
}

export function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 12,
    content: "A test post",
    created_at: "2026-01-01T10:00:00",
    updated_at: "2026-01-01T10:00:00",
    author: { id: 7, username: "alex" },
    likes_count: 2,
    comments_count: 1,
    liked_by_me: false,
    ...overrides,
  };
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 4,
    body: "A thoughtful reply",
    created_at: "2026-01-01T10:00:00",
    author: { id: 8, username: "sam" },
    ...overrides,
  };
}

export function makeTestStore(): AppStore {
  return makeStore();
}

export function authenticate(store: AppStore, user = makeUser()) {
  act(() => {
    store.dispatch(login.fulfilled(user, "test-login", {
      username: user.username,
      password: "password",
    }));
  });
}

export function renderWithStore(
  ui: ReactElement,
  store: AppStore = makeTestStore(),
) {
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { ...render(ui, { wrapper: Wrapper }), store };
}
