import { configureStore } from "@reduxjs/toolkit";
import {
  createPost as createPostApi,
  deletePost as deletePostApi,
  fetchFeedPosts,
  likePost as likePostApi,
  searchPosts as searchPostsApi,
  updatePost as updatePostApi,
} from "./posts.api";
import postsReducer, {
  createPost,
  deletePost,
  getPosts,
  resetSearch,
  searchPosts,
  togglePostLike,
  updatePost,
} from "./post.slice";
import { makePost } from "../../../tests/test-utils";

jest.mock("./posts.api", () => ({
  createPost: jest.fn(),
  deletePost: jest.fn(),
  fetchFeedPosts: jest.fn(),
  likePost: jest.fn(),
  searchPosts: jest.fn(),
  updatePost: jest.fn(),
}));

const mocked = {
  create: jest.mocked(createPostApi),
  remove: jest.mocked(deletePostApi),
  feed: jest.mocked(fetchFeedPosts),
  like: jest.mocked(likePostApi),
  search: jest.mocked(searchPostsApi),
  update: jest.mocked(updatePostApi),
};

function makePostsStore() {
  return configureStore({ reducer: postsReducer });
}

beforeEach(() => jest.clearAllMocks());

it("loads cursor pages and records like state", async () => {
  const post = makePost({ liked_by_me: true });
  mocked.feed.mockResolvedValueOnce([post]);
  const store = makePostsStore();

  await store.dispatch(getPosts({ limit: 1 })).unwrap();
  expect(store.getState()).toMatchObject({
    feedItems: [post],
    feedBeforeId: post.id,
    feedHasMore: true,
    likeStates: { [post.id]: true },
  });
});

it("creates, updates, and deletes posts in the visible timeline", async () => {
  const post = makePost();
  mocked.create.mockResolvedValueOnce(post);
  mocked.update.mockResolvedValueOnce({ ...post, content: "Updated" });
  mocked.remove.mockResolvedValueOnce();
  const store = makePostsStore();

  await store.dispatch(createPost(post.content)).unwrap();
  expect(store.getState().feedItems[0]).toEqual(post);

  await store.dispatch(updatePost({ postId: post.id, content: "Updated" })).unwrap();
  expect(store.getState().feedItems[0].content).toBe("Updated");

  await store.dispatch(deletePost(post.id)).unwrap();
  expect(store.getState().feedItems).toEqual([]);
});

it("searches posts and can reset search state", async () => {
  const post = makePost();
  mocked.search.mockResolvedValueOnce([post]);
  const store = makePostsStore();

  await store.dispatch(searchPosts({ query: "test" })).unwrap();
  expect(store.getState().searchItems).toEqual([post]);
  store.dispatch(resetSearch());
  expect(store.getState()).toMatchObject({
    searchItems: [],
    searchQuery: "",
    searchError: null,
  });
});

it("optimistically likes and rolls back failed likes", async () => {
  const post = makePost();
  mocked.feed.mockResolvedValueOnce([post]);
  mocked.like.mockRejectedValueOnce(new Error("offline"));
  const store = makePostsStore();
  await store.dispatch(getPosts()).unwrap();

  await expect(store.dispatch(togglePostLike({
    postId: post.id,
    liked: true,
    currentLikes: post.likes_count,
    currentLiked: false,
  })).unwrap()).rejects.toBe("offline");

  expect(store.getState().feedItems[0].likes_count).toBe(post.likes_count);
  expect(store.getState().feedItems[0].liked_by_me).toBe(false);
  expect(store.getState().likeError).toBe("offline");
});
