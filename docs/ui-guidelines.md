# TODO App UI Guidelines

This document defines the visual and interaction standards for the TODO app user interface.

## Design System

1. Use Material UI components as the primary component library for layout, forms, buttons, dialogs, and feedback.
2. Keep spacing consistent using an 8px spacing scale (8, 16, 24, 32).
3. Use a card-based layout for task content with clear visual separation between task items.

## Color Palette

1. Use a neutral background (`#F7F9FC`) and dark text (`#1F2937`) for readability.
2. Use primary blue (`#2563EB`) for main actions and interactive highlights.
3. Use success green (`#16A34A`) for completed state indicators.
4. Use warning amber (`#D97706`) for near-due tasks and error red (`#DC2626`) for destructive actions.
5. Maintain at least WCAG AA contrast for all text and interactive elements.

## Typography

1. Use a clean sans-serif font family (Roboto or system fallback).
2. Use a clear hierarchy:
   - Page title: 28px, semibold
   - Section title: 20px, semibold
   - Body text: 16px, regular
   - Helper text: 14px, regular
3. Keep line length and spacing comfortable for scanability.

## Buttons And Controls

1. Primary actions (for example, Add Task, Save) use contained blue buttons.
2. Secondary actions use outlined buttons.
3. Destructive actions use red text or outlined red styles and must require confirmation when deleting tasks.
4. Inputs must show clear focus styles and error states.

## Task List Behavior

1. Each task row shows: title, optional due date, completion status, and quick actions.
2. Completed tasks should display a visual distinction (for example, check icon and subdued text).
3. Active filters (All, Active, Completed) must be visually obvious.
4. Empty states must include a short message and one clear next action.

## Accessibility Requirements

1. All interactive controls must be keyboard accessible.
2. Visible focus indicators are required for links, inputs, and buttons.
3. Form fields must have associated labels.
4. Icons used as controls must have accessible names (`aria-label` or equivalent).
5. Status updates (for example, task saved or deleted) should be announced to assistive technologies.

## Responsive Behavior

1. The layout must work on mobile (>=320px), tablet, and desktop.
2. On small screens, stack controls vertically and keep tap targets at least 44px tall.
3. Avoid horizontal scrolling for core task management workflows.

## Interaction Feedback

1. Show lightweight loading indicators for async actions.
2. Show success and error feedback using non-blocking toasts or alerts.
3. Keep animation subtle and fast (150-250ms) to support clarity without distraction.