import { fireEvent, screen, waitFor } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import {
  authenticate,
  makePost,
  makeUser,
  renderWithStore,
} from "../../../../tests/test-utils";
import {
  deletePost as deletePostApi,
  likePost as likePostApi,
  updatePost as updatePostApi,
} from "../posts.api";
import PostCard from "./PostCard";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock("../posts.api", () => ({
  createPost: jest.fn(),
  deletePost: jest.fn(),
  fetchFeedPosts: jest.fn(),
  likePost: jest.fn(),
  searchPosts: jest.fn(),
  updatePost: jest.fn(),
}));

const mockedDelete = jest.mocked(deletePostApi);
const mockedLike = jest.mocked(likePostApi);
const mockedUpdate = jest.mocked(updatePostApi);
const replace = jest.fn();
const router = {
  bfcacheId: "test",
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  push: jest.fn(),
  replace,
  prefetch: jest.fn(),
} satisfies ReturnType<typeof useRouter>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(usePathname).mockReturnValue("/feed");
  jest.mocked(useRouter).mockReturnValue(router);
  window.confirm = jest.fn(() => true);
});

it("shows post content, counters, and discussion link", () => {
  renderWithStore(<PostCard post={makePost()} />);

  expect(screen.getByText("A test post")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Like post" })).toHaveTextContent("2");
  expect(screen.getByRole("link", { name: /1 comments · View discussion/ })).toHaveAttribute(
    "href",
    "/posts/12",
  );
  expect(screen.queryByRole("button", { name: "Edit post" })).not.toBeInTheDocument();
});

it("lets the author edit a post", async () => {
  const post = makePost();
  mockedUpdate.mockResolvedValueOnce({ ...post, content: "Updated post" });
  const { store } = renderWithStore(<PostCard post={post} />);
  authenticate(store, makeUser());

  fireEvent.click(screen.getByRole("button", { name: "Edit post" }));
  fireEvent.change(screen.getByLabelText("Edit post content"), {
    target: { value: "Updated post" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

  expect(await screen.findByText("Updated post")).toBeInTheDocument();
  expect(mockedUpdate).toHaveBeenCalledWith(post.id, "Updated post");
});

it("likes posts and deletes an author's post", async () => {
  const post = makePost();
  mockedLike.mockResolvedValueOnce({ liked: true });
  mockedDelete.mockResolvedValueOnce();
  const { store } = renderWithStore(<PostCard post={post} />);
  authenticate(store, makeUser());

  fireEvent.click(screen.getByRole("button", { name: "Like post" }));
  await waitFor(() => expect(mockedLike).toHaveBeenCalledWith(post.id, true, expect.anything()));
  expect(await screen.findByRole("button", { name: "Unlike post" })).toHaveTextContent("3");

  fireEvent.click(screen.getByRole("button", { name: "Delete post" }));
  await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith(post.id));
  await waitFor(() => expect(screen.queryByText(post.content)).not.toBeInTheDocument());
});

it("returns to the feed after deleting a standalone post page", async () => {
  const post = makePost();
  mockedDelete.mockResolvedValueOnce();
  jest.mocked(usePathname).mockReturnValue(`/posts/${post.id}`);
  const { store } = renderWithStore(<PostCard post={post} />);
  authenticate(store, makeUser());

  fireEvent.click(screen.getByRole("button", { name: "Delete post" }));
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/feed"));
});
