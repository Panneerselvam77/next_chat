import api from "@/lib/api/axios";
import {
  createPost,
  deletePost,
  fetchFeedPosts,
  fetchPostById,
  fetchPosts,
  likePost,
  searchPosts,
  updatePost,
} from "./posts.api";
import { makePost } from "../../../tests/test-utils";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = jest.mocked(api);

beforeEach(() => jest.clearAllMocks());

describe("posts API", () => {
  it("requests newest feed posts using cursor pagination", async () => {
    const posts = [makePost()];
    mockedApi.get.mockResolvedValueOnce({ data: posts } as never);

    await expect(fetchFeedPosts(30, 10)).resolves.toEqual(posts);
    expect(mockedApi.get).toHaveBeenCalledWith("/posts", {
      params: { before_id: 30, limit: 10 },
      signal: undefined,
    });
  });

  it("lists posts with the requested limit", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] } as never);

    await expect(fetchPosts(40)).resolves.toEqual([]);
    expect(mockedApi.get).toHaveBeenCalledWith("/posts", {
      params: { limit: 40 },
      signal: undefined,
    });
  });

  it("fetches a post by id", async () => {
    const post = makePost();
    mockedApi.get.mockResolvedValueOnce({ data: post } as never);

    await expect(fetchPostById(post.id)).resolves.toEqual(post);
    expect(mockedApi.get).toHaveBeenCalledWith(`/posts/${post.id}`, {
      signal: undefined,
    });
  });

  it("searches post content and author names case-insensitively", async () => {
    const matchingContent = makePost({ content: "Hello World" });
    const matchingAuthor = makePost({
      id: 13,
      content: "Another post",
      author: { id: 8, username: "world_sam" },
    });
    mockedApi.get.mockResolvedValueOnce({
      data: [matchingContent, matchingAuthor],
    } as never);

    await expect(searchPosts(" WORLD ")).resolves.toEqual([
      matchingContent,
      matchingAuthor,
    ]);
  });

  it("creates and updates posts with content bodies", async () => {
    const post = makePost();
    mockedApi.post.mockResolvedValueOnce({ data: post } as never);
    mockedApi.patch.mockResolvedValueOnce({ data: post } as never);

    await expect(createPost("A test post")).resolves.toEqual(post);
    await expect(updatePost(post.id, "Edited")).resolves.toEqual(post);
    expect(mockedApi.post).toHaveBeenCalledWith("/posts", {
      content: "A test post",
    });
    expect(mockedApi.patch).toHaveBeenCalledWith(`/posts/${post.id}`, {
      content: "Edited",
    });
  });

  it("uses documented like and unlike endpoints", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { liked: true } } as never);
    mockedApi.delete.mockResolvedValueOnce({ data: { liked: false } } as never);

    await expect(likePost(12, true)).resolves.toEqual({ liked: true });
    await expect(likePost(12, false)).resolves.toEqual({ liked: false });
    expect(mockedApi.post).toHaveBeenCalledWith(
      "/posts/12/like",
      undefined,
      { signal: undefined },
    );
    expect(mockedApi.delete).toHaveBeenCalledWith("/posts/12/like", {
      signal: undefined,
    });
  });

  it("deletes a post without expecting a body", async () => {
    mockedApi.delete.mockResolvedValueOnce({} as never);

    await expect(deletePost(12)).resolves.toBeUndefined();
    expect(mockedApi.delete).toHaveBeenCalledWith("/posts/12");
  });
});
