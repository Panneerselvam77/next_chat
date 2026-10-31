import { fireEvent, screen, waitFor } from "@testing-library/react";
import { makeTestStore, renderWithStore, makeComment } from "../../../../tests/test-utils";
import {
  createPostComment,
  fetchPostComments,
} from "../comments.api";
import { getPostComments } from "../comments.slice";
import AddCommentForm from "./AddCommentForm";
import CommentCard from "./CommentCard";
import CommentsList from "./CommentsList";

jest.mock("../comments.api", () => ({
  createPostComment: jest.fn(),
  deleteComment: jest.fn(),
  fetchPostComments: jest.fn(),
}));

const mockedCreate = jest.mocked(createPostComment);
const mockedFetch = jest.mocked(fetchPostComments);

beforeEach(() => jest.clearAllMocks());

it("renders comment author, date, and body", () => {
  renderWithStore(<CommentCard comment={makeComment()} />);

  expect(screen.getByText("sam")).toBeInTheDocument();
  expect(screen.getByText("A thoughtful reply")).toBeInTheDocument();
});

it("submits a trimmed comment and clears the form", async () => {
  const comment = makeComment({ body: "A new reply" });
  mockedCreate.mockResolvedValueOnce(comment);
  const store = makeTestStore();
  store.dispatch(getPostComments.pending("load-comments", 12));
  renderWithStore(<AddCommentForm postId={12} />, store);
  const input = screen.getByPlaceholderText("Write a comment...");

  fireEvent.change(input, { target: { value: "  A new reply  " } });
  fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

  await waitFor(() => {
    expect(mockedCreate).toHaveBeenCalledWith(12, "A new reply");
    expect(store.getState().comments.items).toEqual([comment]);
  });
  expect(input).toHaveValue("");
});

it("loads discussion comments and shows the empty state", async () => {
  mockedFetch.mockResolvedValueOnce([]);
  renderWithStore(<CommentsList postId={12} />);

  expect(await screen.findByText("No replies yet")).toBeInTheDocument();
  expect(mockedFetch).toHaveBeenCalledWith(12, expect.anything());
});

it("renders comments returned for a discussion", async () => {
  mockedFetch.mockResolvedValueOnce([makeComment()]);
  renderWithStore(<CommentsList postId={12} />);

  expect(await screen.findByText("A thoughtful reply")).toBeInTheDocument();
});
