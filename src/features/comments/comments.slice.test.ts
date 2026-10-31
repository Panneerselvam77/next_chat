import { configureStore } from "@reduxjs/toolkit";
import {
  createPostComment,
  fetchPostComments,
} from "./comments.api";
import commentsReducer, {
  addPostComment,
  clearComments,
  getPostComments,
} from "./comments.slice";
import { makeComment } from "../../../tests/test-utils";

jest.mock("./comments.api", () => ({
  fetchPostComments: jest.fn(),
  createPostComment: jest.fn(),
}));

const mockedFetch = jest.mocked(fetchPostComments);
const mockedCreate = jest.mocked(createPostComment);

function makeCommentsStore() {
  return configureStore({ reducer: commentsReducer });
}

beforeEach(() => jest.clearAllMocks());

it("loads comments for the selected post", async () => {
  const comment = makeComment();
  mockedFetch.mockResolvedValueOnce([comment]);
  const store = makeCommentsStore();

  await store.dispatch(getPostComments(12)).unwrap();
  expect(store.getState()).toMatchObject({
    items: [comment],
    currentPostId: 12,
    loading: false,
    error: null,
  });
});

it("adds a comment only to its active post", async () => {
  const comment = makeComment();
  mockedCreate.mockResolvedValueOnce(comment);
  const store = makeCommentsStore();
  store.dispatch(getPostComments.pending("load", 12));

  await store.dispatch(
    addPostComment({ postId: 12, body: comment.body }),
  ).unwrap();
  expect(store.getState().items).toEqual([comment]);
});

it("reports failures and clears comment state", async () => {
  mockedFetch.mockRejectedValueOnce(new Error("offline"));
  const store = makeCommentsStore();
  await expect(store.dispatch(getPostComments(12)).unwrap()).rejects.toBe(
    "offline",
  );
  expect(store.getState().error).toBe("offline");

  store.dispatch(clearComments());
  expect(store.getState()).toMatchObject({
    items: [],
    currentPostId: null,
    error: null,
  });
});
