# Social Media API: Front-End Integration Guide

This guide describes the HTTP API available to web and mobile clients. It
matches the current implementation; the interactive OpenAPI page at `/docs`
can also be used to explore schemas and try requests.

## Base URL and conventions

All application endpoints use the `/api/v1` prefix. For local development:

```text
http://localhost:8000/api/v1
```

Send JSON request bodies with `Content-Type: application/json`, except for
login, which uses URL-encoded form fields. Successful JSON responses use
UTF-8. Dates are serialized as ISO 8601 date-time strings.

Unless noted otherwise, protected routes require:

```http
Authorization: Bearer <access_token>
```

The API currently returns arrays directly for collection endpoints (not an
object with `items` or pagination metadata). List results are ordered by
descending database ID. For cursor pagination, use the last item's `id` as
`before_id` in the next request. There is no separate `next_cursor` field.

## Authentication

### Register

`POST /auth/register` — public

Request:

```json
{
  "email": "alex@example.com",
  "username": "alex_dev",
  "password": "a-long-password"
}
```

- Email is validated and normalized to lowercase.
- Username is normalized to lowercase; it must be 3–30 characters of letters,
  digits, or underscores.
- Password must be 8–128 characters.
- Email and username must be unique.

Success: `201 Created`, returns a user object (see [User object](#user-object)).
Duplicate email/username: `409 Conflict`.

### Log in

`POST /auth/token` — public

Send `application/x-www-form-urlencoded`, not JSON:

```text
username=alex_dev&password=a-long-password
```

The `username` field accepts either the username or email address.

Success: `200 OK`

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 1800
}
```

`expires_in` is the token lifetime in seconds. Store the token using the
front-end application's secure storage strategy and attach it as a Bearer
token to protected requests. The current API does not provide refresh-token,
logout, or password-reset endpoints; after expiry, the client must ask the
user to log in again.

Invalid credentials: `401 Unauthorized`.

### Current user

`GET /auth/me` — protected

Returns the authenticated user's [User object](#user-object).

## Users and follows

### User object

```json
{
  "id": 12,
  "email": "alex@example.com",
  "username": "alex_dev",
  "bio": "Building useful things.",
  "created_at": "2026-10-31T08:00:00"
}
```

`bio` can be `null`. Public profile responses currently include the email
address as well as username and bio.

### Read a user profile

`GET /users/{username}` — public

Returns a User object. Usernames are case-insensitive. Unknown username:
`404 Not Found`.

### Update current user's profile

`PATCH /users/me` — protected

Send only fields to change:

```json
{
  "username": "alex_new",
  "bio": "A short profile, up to 160 characters."
}
```

- `username` is optional, 3–30 letters/digits/underscores, and unique.
- `bio` is optional, at most 160 characters; it is trimmed and may be `null`.
- To clear the bio, send `"bio": null`.
- Sending an empty object succeeds without changing profile data.
- Username conflict: `409 Conflict`.

Success: `200 OK`, returns the updated User object.

### Follow / unfollow

- `POST /users/{username}/follow` — protected
- `DELETE /users/{username}/follow` — protected

Both return the resulting state:

```json
{ "following": true }
```

or

```json
{ "following": false }
```

Following an already-followed account and unfollowing an account that is not
followed are safe to repeat. A user cannot follow themselves (`400 Bad
Request`); unknown usernames return `404 Not Found`.

### List followers and following

- `GET /users/me/followers` — protected
- `GET /users/me/following` — protected

Optional query parameters:

| Parameter | Default | Description |
| --- | ---: | --- |
| `limit` | `20` | Requested result count; clamped to 1–100 |
| `before_id` | — | Return users with an ID lower than this value |

Returns an array of User summaries:

```json
[
  { "id": 8, "username": "sam" },
  { "id": 5, "username": "jules" }
]
```

## Posts

### Post object

```json
{
  "id": 41,
  "content": "Hello, social!",
  "created_at": "2026-10-31T08:05:00",
  "updated_at": "2026-10-31T08:05:00",
  "author": { "id": 12, "username": "alex_dev" },
  "likes_count": 3,
  "comments_count": 1,
  "liked_by_me": false
}
```

For unauthenticated requests, `liked_by_me` is `false`. For authenticated
requests, it indicates whether the current user liked that post.

### Create a post

`POST /posts` — protected

```json
{ "content": "Hello, social!" }
```

Content must contain non-whitespace text and be at most 5,000 characters.
Success: `201 Created`, returns the created Post object.

### List posts

`GET /posts` — public; accepts an optional Bearer token

Returns newest IDs first. If a valid token is supplied, `liked_by_me` is
personalized. An invalid supplied token returns `401`.

| Parameter | Default | Description |
| --- | ---: | --- |
| `limit` | `20` | Number of posts to request; 1–100 |
| `before_id` | — | Return posts whose ID is lower than this value |

Use the last post's ID as `before_id` to request the next page.

### Read, edit, or delete one post

- `GET /posts/{post_id}` — public; accepts an optional Bearer token
- `PATCH /posts/{post_id}` — protected, author only
- `DELETE /posts/{post_id}` — protected, author only

Edit request:

```json
{ "content": "Updated post text" }
```

Post content uses the same validation rules as post creation. Successful read
or edit returns the Post object. Successful delete returns `204 No Content`
with no response body. Missing post: `404`; editing or deleting another user's
post: `403 Forbidden`.

### Like / unlike

- `POST /posts/{post_id}/like` — protected
- `DELETE /posts/{post_id}/like` — protected

Responses:

```json
{ "liked": true }
```

or

```json
{ "liked": false }
```

Both actions are safe to repeat. Missing post: `404`.

## Comments

### Comment object

```json
{
  "id": 7,
  "body": "Nice post!",
  "created_at": "2026-10-31T08:10:00",
  "author": { "id": 8, "username": "sam" }
}
```

### List comments

`GET /posts/{post_id}/comments` — public

Optional `limit` defaults to 20 and is bounded to 1–100. Optional `before_id`
returns comments with a lower ID. Results are ordered newest IDs first.
Missing post: `404`.

### Create a comment

`POST /posts/{post_id}/comments` — protected

```json
{ "body": "Nice post!" }
```

Body must contain non-whitespace text and be at most 2,000 characters.
Success: `201 Created`, returns the Comment object.

### Delete a comment

`DELETE /posts/comments/{comment_id}` — protected

The comment's author or the author of the related post may delete it. Success:
`204 No Content`. Missing comment: `404`; insufficient permission: `403`.

## Feed

`GET /feed` — protected

Returns posts from the authenticated user and accounts they follow, ordered by
descending post ID. Each item is a Post object, including personalized
`liked_by_me`.

| Parameter | Default | Description |
| --- | ---: | --- |
| `limit` | `20` | Number of posts to request; 1–100 |
| `before_id` | — | Return posts whose ID is lower than this value |

An empty feed is returned as `[]`.

## Account analytics

`GET /analytics/me` — protected

Returns aggregate totals for the current account:

```json
{
  "posts_count": 12,
  "followers_count": 34,
  "following_count": 20,
  "likes_received": 81,
  "comments_received": 14
}
```

`likes_received` and `comments_received` count engagement on all posts authored
by the current user.

## Front-end request examples

### JavaScript helper

```js
const API_BASE = "http://localhost:8000/api/v1";

async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof URLSearchParams)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.detail ?? `HTTP ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

// Register
const user = await apiRequest("/auth/register", {
  method: "POST",
  body: JSON.stringify({
    email: "alex@example.com",
    username: "alex_dev",
    password: "a-long-password",
  }),
});

// Log in; login expects URL-encoded form data
const credentials = new URLSearchParams({
  username: "alex_dev",
  password: "a-long-password",
});
const session = await fetch(`${API_BASE}/auth/token`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: credentials,
}).then(async (response) => {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail ?? "Login failed");
  return payload;
});

// Load the next page of the feed
const posts = await apiRequest("/feed?limit=20", { token: session.access_token });
const nextPage =
  posts.length === 20
    ? await apiRequest(`/feed?limit=20&before_id=${posts.at(-1).id}`, {
        token: session.access_token,
      })
    : [];
```

In the helper, set `Content-Type: application/json` for JSON string request
bodies. `fetch` does not throw on HTTP errors, so check `response.ok` and handle
the returned status/detail. The API's standard error body is:

```json
{ "detail": "Post not found" }
```

Validation errors (`422`) use FastAPI's structured detail array, which includes
the invalid field location and message. Use those messages to display
field-level feedback. Treat `401` as an expired or missing session; `403` as an
authorization failure; `404` as a missing resource; and `409` as a uniqueness
conflict.

## Endpoint index

| Method | Path | Access | Success |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | `201` User |
| `POST` | `/auth/token` | Public | `200` Token |
| `GET` | `/auth/me` | Bearer | `200` User |
| `GET` | `/users/{username}` | Public | `200` User |
| `PATCH` | `/users/me` | Bearer | `200` User |
| `POST` / `DELETE` | `/users/{username}/follow` | Bearer | `200` Follow state |
| `GET` | `/users/me/followers` | Bearer | `200` User summary array |
| `GET` | `/users/me/following` | Bearer | `200` User summary array |
| `POST` | `/posts` | Bearer | `201` Post |
| `GET` | `/posts` | Public, optional Bearer | `200` Post array |
| `GET` / `PATCH` / `DELETE` | `/posts/{post_id}` | Public / Bearer author | `200` Post / `204` |
| `POST` / `DELETE` | `/posts/{post_id}/like` | Bearer | `200` Like state |
| `GET` / `POST` | `/posts/{post_id}/comments` | Public / Bearer | `200` array / `201` Comment |
| `DELETE` | `/posts/comments/{comment_id}` | Bearer comment or post author | `204` |
| `GET` | `/feed` | Bearer | `200` Post array |
| `GET` | `/analytics/me` | Bearer | `200` Analytics |
