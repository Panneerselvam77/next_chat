import { waitFor } from "@testing-library/react";
import { getCurrentUserApi } from "@/lib/api/auth-api";
import { makeUser, renderWithStore } from "../../../tests/test-utils";
import { AuthInitializer } from "./AuthInitializer";

jest.mock("@/lib/api/auth-api", () => ({
  getCurrentUserApi: jest.fn(),
  loginApi: jest.fn(),
  logoutApi: jest.fn(),
  registerApi: jest.fn(),
}));

const mockedGetCurrentUser = jest.mocked(getCurrentUserApi);

it("restores the authenticated session on mount", async () => {
  const user = makeUser();
  mockedGetCurrentUser.mockResolvedValueOnce(user);
  const { store } = renderWithStore(<AuthInitializer />);

  await waitFor(() => {
    expect(store.getState().auth.user).toEqual(user);
  });
  expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
});
