# Authentication Architecture

This document describes the authentication flow used by the Next.js app. The
browser communicates with same-origin Next.js route handlers; those handlers
communicate with DummyJSON and keep authentication tokens out of client-side
JavaScript.

## Components

| Component | Responsibility |
| --- | --- |
| `src/app/(auth)/login/page.tsx` | Collects credentials, dispatches the login thunk, and navigates to `/feed` after success. |
| `src/app/(auth)/register/page.tsx` | Collects registration details, dispatches registration, and navigates to `/login` after success. |
| `src/features/auth/auth.slice.ts` | Redux async thunks and in-memory UI state for the current user, loading, and errors. |
| `src/features/auth/AuthInitializer.tsx` | Requests the current session after the Redux provider mounts. |
| `src/lib/api/auth-api.ts` | Same-origin browser API client for login, registration, session lookup, and logout. |
| `src/app/api/auth/login/route.ts` | Validates login input, requests a DummyJSON session, and sets token cookies. |
| `src/app/api/auth/register/route.ts` | Validates registration input and forwards it to DummyJSON. |
| `src/app/api/auth/me/route.ts` | Reads the access-token cookie and returns the verified user. |
| `src/app/api/auth/logout/route.ts` | Expires the token cookies. |
| `src/lib/auth/session.ts` | Verifies the access token with DummyJSON and maps the response to the app's `AuthUser` shape. |
| `src/app/feed/page.tsx` | Server-protects `/feed` by checking the cookie and validating the session before rendering. |

## Login

1. The login form dispatches `login` with the username and password.
2. `loginApi` posts to `POST /api/auth/login` on the same origin.
3. The route handler validates the input and exchanges the credentials with
   `https://dummyjson.com/auth/login`.
4. On success, it returns the user profile and sets `accessToken` and
   `refreshToken` as `HttpOnly`, `SameSite=Lax`, root-path cookies. The cookies
   have a 30-minute max age; `Secure` is enabled in production.
5. The browser cannot read the tokens from JavaScript. It sends the cookies
   automatically with same-origin requests.
6. The login page navigates to `/feed`.

## Session restoration

`StoreProvider` mounts `AuthInitializer`, which dispatches `getCurrentUser`.
The browser calls `GET /api/auth/me`; the route handler reads the HttpOnly
access-token cookie and asks `getAuthenticatedUser` to verify it with
DummyJSON's `/auth/me` endpoint. A valid response populates the in-memory Redux
user state. If the cookie is missing or invalid, Redux records an unauthenticated
state. The token itself is never stored in Redux.

## Protected feed

`src/app/feed/page.tsx` is a server component. Before rendering feed content, it
reads the access-token cookie and validates it with `getAuthenticatedUser`.
Missing or invalid sessions are redirected to `/login`. This server-side check
is the authorization boundary; client-side Redux state is for UI state and is
not treated as proof of authentication.

## Registration

The registration form calls `POST /api/auth/register`. The route handler checks
that username, email, and password are present and forwards the details to
DummyJSON's `POST /users/add`. If the request succeeds, the form navigates to
`/login`; registration does not automatically create a login session.

**Backend limitation:** DummyJSON's `/users/add` endpoint is a mock endpoint and
does not persist new users. Registration therefore demonstrates the request and
redirect flow, but does not create an account that will be available for a
subsequent login. Persistent registration requires an application backend and
user store.

## Logout

The feed's logout button (and the `/logout` page) dispatches the `logout` thunk,
which posts to `POST /api/auth/logout`. The route handler expires both token
cookies. On success, Redux clears the user and the client navigates to `/login`
and refreshes the route so the server sees the cleared cookies.

## Session and security notes

- The access token and refresh token are held in HttpOnly cookies, not local
  storage or Redux.
- The login route sets a refresh-token cookie, but this app does not currently
  implement a refresh-token exchange. When the access token expires, the user
  must log in again.
- The current session validation depends on DummyJSON being available.
- `SameSite=Lax` and same-origin API requests reduce cross-site request risk.
  If this app adds sensitive cross-origin flows or changes cookie policy, add
  explicit CSRF protections and review cookie settings.
