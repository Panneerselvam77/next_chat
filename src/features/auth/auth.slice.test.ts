import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi,
} from "@/lib/api/auth-api";
import { makeStore } from "@/store/store";
import { makeUser } from "../../../tests/test-utils";
import { clearAuthError, getCurrentUser, login, logout, register } from "./auth.slice";

jest.mock("@/lib/api/auth-api", () => ({
  getCurrentUserApi: jest.fn(),
  loginApi: jest.fn(),
  logoutApi: jest.fn(),
  registerApi: jest.fn(),
}));

const mockedAuthApi = {
  getCurrentUserApi: jest.mocked(getCurrentUserApi),
  loginApi: jest.mocked(loginApi),
  logoutApi: jest.mocked(logoutApi),
  registerApi: jest.mocked(registerApi),
};

beforeEach(() => jest.clearAllMocks());

it("stores the authenticated user after login", async () => {
  const user = makeUser();
  mockedAuthApi.loginApi.mockResolvedValueOnce(user);
  const store = makeStore();

  await expect(
    store.dispatch(login({ username: "alex", password: "pass" })).unwrap(),
  ).resolves.toEqual(user);
  expect(store.getState().auth).toMatchObject({
    user,
    isAuthenticated: true,
    isLoading: false,
    initialized: true,
  });
});

it("keeps login errors in auth state", async () => {
  mockedAuthApi.loginApi.mockRejectedValueOnce(new Error("Bad credentials"));
  const store = makeStore();

  await expect(
    store.dispatch(login({ username: "alex", password: "bad" })).unwrap(),
  ).rejects.toBe("Bad credentials");
  expect(store.getState().auth.error).toBe("Bad credentials");
  store.dispatch(clearAuthError());
  expect(store.getState().auth.error).toBeNull();
});

it("registers and restores the current session", async () => {
  const user = makeUser();
  mockedAuthApi.registerApi.mockResolvedValueOnce();
  mockedAuthApi.getCurrentUserApi.mockResolvedValueOnce(user);
  const store = makeStore();

  await expect(
    store.dispatch(register({
      username: "alex",
      email: user.email,
      password: "password",
    })).unwrap(),
  ).resolves.toBeUndefined();
  await expect(store.dispatch(getCurrentUser()).unwrap()).resolves.toEqual(user);
  expect(store.getState().auth.isAuthenticated).toBe(true);
});

it("clears the session on logout and clears auth errors", async () => {
  const user = makeUser();
  mockedAuthApi.loginApi.mockResolvedValueOnce(user);
  mockedAuthApi.logoutApi.mockResolvedValueOnce();
  const store = makeStore();
  await store.dispatch(login({ username: "alex", password: "pass" }));

  await store.dispatch(logout()).unwrap();
  expect(store.getState().auth).toMatchObject({
    user: null,
    isAuthenticated: false,
    initialized: true,
  });
});
