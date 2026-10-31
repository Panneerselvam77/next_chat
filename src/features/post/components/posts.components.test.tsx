import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import { renderWithStore, authenticate, makePost, makeUser } from "../../../../tests/test-utils";
import { createPost as createPostApi, fetchFeedPosts, searchPosts as searchPostsApi } from "../posts.api";
import CreatePostForm from "./CreatePostForm";
import PostFeed from "./PostFeed";
import PostSearch from "./PostSearch";

jest.mock("../posts.api", () => ({
  createPost: jest.fn(),
  deletePost: jest.fn(),
  fetchFeedPosts: jest.fn(),
  likePost: jest.fn(),
  searchPosts: jest.fn(),
  updatePost: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

const mockedCreate = jest.mocked(createPostApi);
const mockedFeed = jest.mocked(fetchFeedPosts);
const mockedSearch = jest.mocked(searchPostsApi);
const router = {
  bfcacheId: "test",
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
} satisfies ReturnType<typeof useRouter>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  jest.mocked(usePathname).mockReturnValue("/feed");
  jest.mocked(useRouter).mockReturnValue(router);
});

it("publishes a post, clears the composer, and keeps it visible", async () => {
  const post = makePost({ content: "Published from the composer" });
  mockedCreate.mockResolvedValueOnce(post);
  mockedFeed.mockResolvedValueOnce([]);
  const { store } = renderWithStore(
    <CreatePostForm username="alex" />,
  );
  authenticate(store, makeUser());

  const input = screen.getByLabelText("Post content");
  fireEvent.change(input, { target: { value: "  Published from the composer  " } });
  expect(screen.getByText("A")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Post" }));

  await waitFor(() => {
    expect(store.getState().posts.feedItems[0]).toEqual(post);
  });
  expect(mockedCreate).toHaveBeenCalledWith("Published from the composer");
  expect(input).toHaveValue("");
});

it("shows the initial loading state and then renders feed posts", async () => {
  const post = makePost({ content: "Community timeline" });
  mockedFeed.mockResolvedValueOnce([post]);
  renderWithStore(<PostFeed />);

  expect(await screen.findByText("Community timeline")).toBeInTheDocument();
});

it("debounces search and clears results when the query is cleared", async () => {
  const post = makePost({ content: "Found by search" });
  mockedSearch.mockResolvedValueOnce([post]);
  jest.useFakeTimers();
  const { store } = renderWithStore(<PostSearch />);
  const input = screen.getByRole("textbox", { name: "Search posts" });

  fireEvent.change(input, { target: { value: "  hello " } });
  await act(async () => {
    jest.advanceTimersByTime(300);
  });

  await waitFor(() => expect(mockedSearch).toHaveBeenCalledWith("hello", expect.anything()));
  expect(await screen.findByText("Found by search")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(store.getState().posts.searchItems).toEqual([]);
  expect(screen.queryByText("Search results")).not.toBeInTheDocument();
});
