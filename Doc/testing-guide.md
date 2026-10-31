# Testing Guide

This guide explains how to run and add tests in this project. It is written for
contributors who may be new to Jest, Redux, or React Testing Library.

## What the tests check

The test suite checks important application behavior without needing a running
web server or a live FastAPI database:

| Test type | What it checks | Example |
| --- | --- | --- |
| API tests | The URL, request method, parameters, body, and response handling used by an API function. The HTTP client is mocked, so no real request is sent. | `src/features/post/posts.api.test.ts` |
| Redux tests | How async actions and reducers update the application state when work succeeds or fails. API functions are mocked. | `src/features/post/post.slice.test.ts` |
| Component tests | What a user can see and do in a React component, such as submitting a form or clicking a button. Components are rendered in a simulated browser environment. | `src/features/post/components/PostCard.test.tsx` |

These are automated unit and component tests. They do not replace testing the
whole application against a real API, checking visual layouts in a real
browser, or running load tests.

## Prerequisites

Install the project's dependencies from the project root if you have not
already done so:

```bash
npm install
```

Tests do not require the Next.js development server or a running FastAPI server.
The tests use mocked API responses instead.

## Running tests

Run the full test suite:

```bash
npm test
```

Run one test file while working on a specific feature:

```bash
npm test -- src/features/post/posts.api.test.ts
```

Run tests in watch mode. Jest stays open and reruns relevant tests when files
change; press `q` to quit:

```bash
npm run test:watch
```

Run tests and collect coverage:

```bash
npm test -- --coverage
```

Coverage describes which executable lines, functions, and decision branches
were visited while the tests ran. It is a useful way to spot untested behavior,
but a high percentage does not by itself prove that behavior is correct. The
coverage command prints a summary in the terminal and creates a detailed HTML
report at `coverage/lcov-report/index.html`. The generated `coverage/` folder
is ignored by Git and can be recreated at any time.

Before sharing a change, also run the project checks:

```bash
npm run lint
npx tsc --noEmit --pretty false
```

Jest checks how the code behaves at runtime. TypeScript checks whether the code
and tests use types correctly. Lint checks code-quality rules. These checks
serve different purposes, so run all three.

## How Jest is configured

The configuration lives in [`jest.config.ts`](../jest.config.ts):

- `next/jest.js` configures Jest to understand the project's Next.js and
  TypeScript setup.
- `testEnvironment: "jsdom"` provides a simulated browser for React component
  tests. It supports browser-like APIs such as the document and form elements,
  but it is not a full browser.
- `setupFilesAfterEnv` loads [`jest.setup.ts`](../jest.setup.ts), which
  registers the `jest-dom` matchers. These let tests make readable checks such
  as `toBeInTheDocument()` and `toHaveValue()`.
- `moduleNameMapper` teaches Jest that imports beginning with `@/` point to the
  `src/` folder, just as they do in the application.
- `collectCoverageFrom` measures runtime files under `src/features`. Type-only
  `*.types.ts` files and test files are not included. The empty
  `src/features/users/users.slice.ts` is excluded because there is no runtime
  behavior there to exercise.

Jest discovers files named `*.test.ts` and `*.test.tsx`. Keep a test close to
the feature it checks and give it the same base name as the module or a clear
feature-oriented name.

## Test file map

The current tests are grouped by the kind of behavior they cover:

| Area | Test files |
| --- | --- |
| Authentication | `src/features/auth/auth.slice.test.ts`, `src/features/auth/AuthInitializer.test.tsx`, `src/lib/api/auth-api.test.ts` |
| Comments | `src/features/comments/comments.api.test.ts`, `src/features/comments/comments.slice.test.ts`, `src/features/comments/components/comments.components.test.tsx` |
| Posts | `src/features/post/posts.api.test.ts`, `src/features/post/post.slice.test.ts`, `src/features/post/components/PostCard.test.tsx`, `src/features/post/components/posts.components.test.tsx` |
| Users | `src/features/users/users.api.test.ts`, `src/features/users/components/user.components.test.tsx` |

The `*.types.ts` files only define TypeScript types and interfaces. They are
checked by TypeScript rather than executed as Jest tests. If a currently empty
module gains runtime behavior later, add tests for that behavior.

Shared fixtures and helpers are in
[`tests/test-utils.tsx`](../tests/test-utils.tsx). Use them instead of creating
slightly different user, post, comment, or Redux-store setup in every test.

## Basic testing vocabulary

- **Test suite:** A file containing one or more related tests.
- **Test case:** One example of behavior the test expects, usually declared
  with `it(...)` or `test(...)`.
- **Assertion:** A check that confirms the observed result matches the
  expected result, for example `expect(button).toBeDisabled()`.
- **Mock:** A controlled replacement for a dependency. A mock lets a test
  simulate API success or failure without making a real network request.
- **Fixture:** Sample data used by a test, such as a sample user or post.

Most tests follow the **Arrange, Act, Assert** pattern:

1. **Arrange:** Prepare sample data and mocks.
2. **Act:** Call the function, render the component, or interact with the UI.
3. **Assert:** Check the result and any important side effects.

For example:

```tsx
it("shows a post's content", () => {
  // Arrange and render the component.
  renderWithStore(<PostCard post={makePost({ content: "Hello" })} />);

  // Assert what a user can see.
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
```

## Reusing test data and the Redux store

The helpers in `tests/test-utils.tsx` provide sample objects:

```ts
const user = makeUser();
const post = makePost({ content: "A more specific post" });
const comment = makeComment({ body: "A more specific comment" });
```

Each helper supplies sensible defaults. Pass an object to override only the
fields relevant to the test.

For a component that reads or updates Redux state, render it with the shared
store wrapper:

```tsx
const { store } = renderWithStore(<SomeComponent />);
```

`renderWithStore` creates a real application store by default, wraps the
component in Redux's `Provider`, and returns the store so the test can inspect
the resulting state. To start from an authenticated state:

```tsx
const { store } = renderWithStore(<SomeComponent />);
authenticate(store, makeUser());
```

Prefer checking the user-visible result first. Inspect the store directly when
the state transition itself is what the test is meant to verify.

## Writing an API test

API tests check that our code calls the HTTP client correctly. They do not test
whether the FastAPI server itself behaves correctly.

The usual steps are:

1. Mock the shared Axios client so no network request is made.
2. Give the mock the response that this test needs.
3. Call the API function.
4. Check the returned value and the request details.

Example based on the posts API:

```ts
import api from "@/lib/api/axios";
import { fetchPostById } from "./posts.api";
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

it("fetches a post by its id", async () => {
  const post = makePost();
  jest.mocked(api.get).mockResolvedValueOnce({ data: post } as never);

  await expect(fetchPostById(post.id)).resolves.toEqual(post);
  expect(api.get).toHaveBeenCalledWith(`/posts/${post.id}`, {
    signal: undefined,
  });
});
```

Use `mockResolvedValueOnce` when the request should succeed. Use
`mockRejectedValueOnce` to check error handling. The `Once` form keeps one
test's response from accidentally affecting another test.

## Writing a Redux test

Redux tests use a real reducer/store and mock only the API dependency. This
checks the application's actual state updates without requiring a server.

Typical steps:

1. Mock the API function imported by the slice.
2. Create a store using the slice reducer (or the shared application store if
   the behavior involves several slices).
3. Set the API mock's result.
4. Dispatch the async action and wait for it with `.unwrap()`.
5. Assert on the resulting state.

For example, after mocking `fetchFeedPosts` and creating a store with the posts
reducer:

```ts
mockedFetchFeed.mockResolvedValueOnce([post]);
const store = makePostsStore();

await store.dispatch(getPosts()).unwrap();

expect(store.getState().feedItems).toContainEqual(post);
```

For an expected error, make the API mock reject and assert that the thunk
rejects and the slice records a useful error message. Tests should include
important failure behavior as well as successful behavior.

## Writing a React component test

React Testing Library tests should interact with components in ways similar to
a person using the page:

- Find controls by their accessible role and name, such as
  `screen.getByRole("button", { name: "Post" })`.
- Enter text with `fireEvent.change` (or a user-event helper if the project
  adds one).
- Click buttons with `fireEvent.click`.
- Check the visible result with matchers such as `toHaveValue()` or
  `toBeInTheDocument()`.

For asynchronous UI updates, use `findBy...` or `waitFor`:

```tsx
fireEvent.click(screen.getByRole("button", { name: "Post" }));

expect(await screen.findByText("Your post text")).toBeInTheDocument();
```

`findBy...` waits for an element to appear. `waitFor` is useful when checking a
mock call or a Redux state update that may happen after an async action. Do not
add arbitrary time delays; wait for the behavior the user should observe.

When a component uses Next.js navigation hooks, mock `next/navigation` in the
test and provide the router methods the component needs. When a component
dispatches API-backed Redux actions, mock the API module and render with the
Redux provider helper.

## Timers and debounced behavior

Some UI waits briefly before making a request. For example, post search is
debounced so it does not send a request for every keystroke. A timer-based test
can advance Jest's fake clock instead of waiting in real time:

```tsx
jest.useFakeTimers();
fireEvent.change(input, { target: { value: "hello" } });

await act(async () => {
  jest.advanceTimersByTime(300);
});

expect(mockedSearch).toHaveBeenCalled();
jest.useRealTimers();
```

Always restore real timers after a fake-timer test. Otherwise, a later test
could inherit the fake clock and behave unexpectedly.

## Keeping tests reliable

- Give each test one clear behavior to check.
- Reset mocks between tests with `jest.clearAllMocks()` or
  `jest.resetAllMocks()` when appropriate.
- Use a fresh Redux store for each test. Do not share mutable application
  state between test cases.
- Mock external boundaries (HTTP, navigation, browser APIs), not the function
  whose behavior the test is meant to verify.
- Prefer accessible labels, roles, and visible text over implementation
  details such as CSS classes.
- Make failure messages understandable and test the important failure path.
- Do not make a test depend on a real API, database, network, machine clock,
  or another test running first.
- If a test fails, run that file alone first, read the first failing
  assertion, and compare the expected behavior with the implementation.

## Common questions

### Why is a component test not opening a browser?

Jest uses jsdom, a lightweight simulation of browser DOM APIs. It is suitable
for testing component rendering and interaction, but it does not render a
faithful visual page. Use a real browser or end-to-end testing tool for visual
and full navigation checks.

### Why does an API test pass if the backend is offline?

The API client is mocked. The test verifies how the frontend constructs and
handles a request; it does not contact FastAPI. Use an integration test or
manual environment check to verify the frontend and backend work together.

### Does coverage mean every possible case has been tested?

No. Coverage measures which code ran, not whether every input, edge case, or
business rule was checked. Read the assertions and add tests for meaningful
success, failure, and boundary cases.
