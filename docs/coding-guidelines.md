# TODO App Coding Guidelines

The TODO app should be developed with a consistent coding style that emphasizes clarity, maintainability, and predictable behavior across frontend and backend code.

Write code in small, focused units with meaningful names for files, functions, variables, and components. Favor readability over cleverness, and prefer explicit logic when there is any tradeoff between brevity and comprehension. Use consistent formatting throughout the codebase, including indentation, line breaks, spacing, and quote style, so that diffs stay clean and easy to review.

Imports should be organized in logical groups: standard library or framework imports first, third-party packages second, and local project modules last. Within each group, keep imports ordered consistently (for example alphabetically). Remove unused imports and avoid circular dependencies by keeping module boundaries clear.

Follow general conventions used by the existing project structure. Place frontend concerns in the frontend package and backend concerns in the backend package. Keep test files close to their intended convention and naming strategy, and prefer file names that clearly match their responsibility.

Code quality principles should be applied continuously. Use the DRY principle to avoid duplicated logic, but do not over-abstract prematurely. Keep functions short and single-purpose, and extract shared behavior into utilities only when it improves reuse and readability. Favor composition over deep inheritance patterns, and keep component and API contracts simple.

Use defensive coding practices for reliability: validate inputs, handle edge cases, and provide clear error handling paths. Avoid silent failures. For asynchronous code, handle promises consistently and keep side effects easy to trace.

A linter should be used as a standard quality gate for all new code and refactors. Follow ESLint rules configured by the project, address warnings intentionally, and do not suppress rules without a documented reason. Linting should run locally during development and in CI to prevent style drift and catch common issues early.

Before merging, ensure changes are understandable in review, covered by appropriate tests, and aligned with the project documentation standards.