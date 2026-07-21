# TODO App Testing Guidelines

This document defines the testing principles and standards for the TODO app across backend, frontend, and end-to-end workflows.

## Summary Of Testing Practices

1. Prioritize fast, reliable tests that provide clear feedback.
2. Build a balanced test pyramid: more unit tests, fewer integration tests, and a small set of critical E2E tests.
3. Keep tests deterministic, isolated, and independent.
4. Ensure tests are readable, maintainable, and aligned with real user and API behavior.
5. Every new feature or behavior change must include appropriate tests.

## Unit Testing Standards

1. Use Jest to test individual functions and React components in isolation.
2. Use file naming convention `*.test.js` or `*.test.ts`.
3. Place backend unit tests in `packages/backend/__tests__/`.
4. Place frontend unit tests in `packages/frontend/src/__tests__/`.
5. Name unit test files after what they test (for example, `app.test.js` for `app.js`).

## Integration Testing Standards

1. Use Jest + Supertest for backend API endpoint tests with real HTTP requests.
2. Place integration tests in `packages/backend/__tests__/integration/`.
3. Use naming convention `*.test.js` or `*.test.ts`.
4. Name integration test files based on endpoint scope (for example, `todos-api.test.js`).

## End-To-End Testing Standards

1. Use Playwright for complete UI workflow testing through browser automation.
2. Place E2E tests in `tests/e2e/`.
3. Use naming convention `*.spec.js` or `*.spec.ts`.
4. Name files by user journey (for example, `todo-workflow.spec.js`).
5. Playwright tests must run with one browser only.
6. Playwright tests must use the Page Object Model (POM) pattern.
7. Limit E2E coverage to 5-8 critical user journeys focused on happy paths and key edge cases.

## Port Configuration Standards

1. Always use environment variables with sensible defaults for port configuration.
2. Backend standard:

```js
const PORT = process.env.PORT || 3030;
```

3. Frontend standard: React default port is 3000 and can be overridden with the `PORT` environment variable.
4. Port configurability is required for CI/CD workflows that detect or assign ports dynamically.

## Isolation, Hooks, And Repeatability

1. All tests must be isolated and independent.
2. Each test must create or mock the data it needs and must not depend on other test execution order.
3. Setup and teardown hooks are required where relevant to keep reruns stable.
4. Tests must pass reliably across repeated local and CI runs.

## Maintainability Requirements

1. Keep test code simple, explicit, and organized by feature.
2. Avoid brittle selectors and implementation-detail assertions in UI tests.
3. Prefer clear test names that describe behavior and expected outcomes.
4. Refactor duplicated test setup into shared helpers or fixtures when duplication grows.