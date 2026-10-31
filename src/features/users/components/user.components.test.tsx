import { screen } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import { makePost, makeUser, renderWithStore } from "../../../../tests/test-utils";
import UserPosts from "./UserPosts";
import UserProfile from "./UserProfile";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

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
  jest.mocked(usePathname).mockReturnValue("/users/alex");
  jest.mocked(useRouter).mockReturnValue(router);
});

it("renders profile details and bio", () => {
  renderWithStore(<UserProfile user={makeUser()} />);

  expect(screen.getByRole("heading", { name: "alex" })).toBeInTheDocument();
  expect(screen.getByText("@alex")).toBeInTheDocument();
  expect(screen.getByText("Hello there")).toBeInTheDocument();
  expect(screen.getByText("alex@example.com")).toBeInTheDocument();
});

it("shows an empty state when the user has no posts", () => {
  renderWithStore(<UserPosts posts={[]} />);

  expect(screen.getByText("No posts yet")).toBeInTheDocument();
});

it("renders a user's posts", () => {
  renderWithStore(<UserPosts posts={[makePost({ content: "Profile post" })]} />);

  expect(screen.getByRole("heading", { name: "Posts" })).toBeInTheDocument();
  expect(screen.getByText("Profile post")).toBeInTheDocument();
});
