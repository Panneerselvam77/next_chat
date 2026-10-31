import api from "@/lib/api/axios";
import { fetchPosts } from "@/features/post/posts.api";
import {
  fetchFollowers,
  fetchFollowing,
  fetchMyAnalytics,
  fetchUserByUsername,
  fetchUserPosts,
  followUser,
  unfollowUser,
  updateMyProfile,
} from "./users.api";
import { makePost, makeUser } from "../../../tests/test-utils";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock("@/features/post/posts.api", () => ({
  fetchPosts: jest.fn(),
}));

const mockedApi = jest.mocked(api);
const mockedFetchPosts = jest.mocked(fetchPosts);

beforeEach(() => jest.clearAllMocks());

it("encodes usernames when fetching public profiles", async () => {
  const user = makeUser({ username: "sam one" });
  mockedApi.get.mockResolvedValueOnce({ data: user } as never);

  await expect(fetchUserByUsername("sam one")).resolves.toEqual(user);
  expect(mockedApi.get).toHaveBeenCalledWith("/users/sam%20one", {
    signal: undefined,
  });
});

it("updates profile fields", async () => {
  const user = makeUser();
  const profile = { bio: null };
  mockedApi.patch.mockResolvedValueOnce({ data: user } as never);

  await expect(updateMyProfile(profile)).resolves.toEqual(user);
  expect(mockedApi.patch).toHaveBeenCalledWith("/users/me", profile);
});

it("follows and unfollows a user", async () => {
  mockedApi.post.mockResolvedValueOnce({ data: { following: true } } as never);
  mockedApi.delete.mockResolvedValueOnce({ data: { following: false } } as never);

  await expect(followUser("sam one")).resolves.toEqual({ following: true });
  await expect(unfollowUser("sam one")).resolves.toEqual({ following: false });
  expect(mockedApi.post).toHaveBeenCalledWith("/users/sam%20one/follow");
  expect(mockedApi.delete).toHaveBeenCalledWith("/users/sam%20one/follow");
});

it("loads follower and following cursor pages", async () => {
  const users = [{ id: 4, username: "sam" }];
  mockedApi.get
    .mockResolvedValueOnce({ data: users } as never)
    .mockResolvedValueOnce({ data: users } as never);

  await expect(fetchFollowers(5, 9)).resolves.toEqual(users);
  await expect(fetchFollowing()).resolves.toEqual(users);
  expect(mockedApi.get).toHaveBeenNthCalledWith(1, "/users/me/followers", {
    params: { limit: 5, before_id: 9 },
    signal: undefined,
  });
  expect(mockedApi.get).toHaveBeenNthCalledWith(2, "/users/me/following", {
    params: { limit: 20, before_id: undefined },
    signal: undefined,
  });
});

it("filters fetched public posts to a user", async () => {
  const ownPost = makePost();
  const otherPost = makePost({
    id: 13,
    author: { id: 99, username: "other" },
  });
  mockedFetchPosts.mockResolvedValueOnce([ownPost, otherPost]);

  await expect(fetchUserPosts(ownPost.author.id)).resolves.toEqual([ownPost]);
});

it("loads current-account analytics", async () => {
  const analytics = {
    posts_count: 2,
    followers_count: 3,
    following_count: 4,
    likes_received: 5,
    comments_received: 6,
  };
  mockedApi.get.mockResolvedValueOnce({ data: analytics } as never);

  await expect(fetchMyAnalytics()).resolves.toEqual(analytics);
  expect(mockedApi.get).toHaveBeenCalledWith("/analytics/me");
});
