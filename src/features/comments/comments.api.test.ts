import api from "@/lib/api/axios";
import {
  createPostComment,
  deleteComment,
  fetchPostComments,
} from "./comments.api";
import { makeComment } from "../../../tests/test-utils";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = jest.mocked(api);

beforeEach(() => jest.clearAllMocks());

it("fetches comments with cursor parameters", async () => {
  const comments = [makeComment()];
  mockedApi.get.mockResolvedValueOnce({ data: comments } as never);

  await expect(fetchPostComments(12, undefined, 10, 4)).resolves.toEqual(comments);
  expect(mockedApi.get).toHaveBeenCalledWith("/posts/12/comments", {
    params: { limit: 10, before_id: 4 },
    signal: undefined,
  });
});

it("creates a post comment using the documented route and body", async () => {
  const comment = makeComment();
  mockedApi.post.mockResolvedValueOnce({ data: comment } as never);

  await expect(createPostComment(12, "hello")).resolves.toEqual(comment);
  expect(mockedApi.post).toHaveBeenCalledWith("/posts/12/comments", {
    body: "hello",
  });
});

it("deletes a comment by id", async () => {
  mockedApi.delete.mockResolvedValueOnce({} as never);

  await expect(deleteComment(4)).resolves.toBeUndefined();
  expect(mockedApi.delete).toHaveBeenCalledWith("/posts/comments/4");
});
