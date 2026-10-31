import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi,
} from "./auth-api";
import { makeUser } from "../../../tests/test-utils";

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();

function mockResponse(payload: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  } as Response;
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
});

it("logs in through the same-origin cookie route", async () => {
  const user = makeUser();
  fetchMock.mockResolvedValueOnce(mockResponse({ user }));

  await expect(
    loginApi({ username: "alex", password: "pass" }),
  ).resolves.toEqual(user);
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/auth/login",
    expect.objectContaining({
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify({ username: "alex", password: "pass" }),
    }),
  );
});

it("registers an account", async () => {
  fetchMock.mockResolvedValueOnce(mockResponse(makeUser(), 201));

  await expect(
    registerApi({
      username: "alex",
      email: "alex@example.com",
      password: "password",
    }),
  ).resolves.toBeUndefined();
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/auth/register",
    expect.objectContaining({ method: "POST" }),
  );
});

it("reads the current user without caching", async () => {
  const user = makeUser();
  fetchMock.mockResolvedValueOnce(mockResponse({ user }));

  await expect(getCurrentUserApi()).resolves.toEqual(user);
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/auth/me",
    expect.objectContaining({ cache: "no-store", credentials: "same-origin" }),
  );
});

it("logs out and reports API detail errors", async () => {
  fetchMock.mockResolvedValueOnce(mockResponse({ message: "done" }));
  await expect(logoutApi()).resolves.toBeUndefined();

  fetchMock.mockResolvedValueOnce(
    mockResponse({ detail: "Invalid credentials" }, 401),
  );
  await expect(
    loginApi({ username: "alex", password: "wrong" }),
  ).rejects.toThrow("Invalid credentials");
});
