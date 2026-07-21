# TODO App Functional Requirements

This document defines the core functional requirements for the TODO app. The goal is to make expected behavior explicit for both implementation and testing.

## Task Lifecycle

1. The user can create a new task with a required title.
2. The user can edit an existing task title.
3. The user can delete an existing task.
4. The user can mark a task as completed.
5. The user can mark a completed task as active again.

## Task Details

1. The user can optionally add a description to a task.
2. The user can optionally assign a due date to a task.
3. The user can update or remove a task due date.

## Filtering And Sorting

1. The user can filter tasks by status: all, active, and completed.
2. The task list is sorted by due date ascending when due dates are present.
3. Tasks without a due date appear after tasks with a due date.
4. If two tasks have the same due date, the newest task appears first.

## Validation And UX Behavior

1. The app prevents creation of a task with an empty title.
2. The app trims leading and trailing whitespace from task titles.
3. The app shows a clear empty-state message when no tasks exist.

## Persistence

1. Tasks persist across page reloads.
2. Task completion state, due dates, and descriptions are preserved when data is reloaded.