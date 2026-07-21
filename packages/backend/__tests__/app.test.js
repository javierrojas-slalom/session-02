const {
  normalizeTaskInput,
  parseTaskId,
  normalizeStatusFilter,
  isIsoDate,
} = require('../src/taskValidation');

describe('taskValidation unit tests', () => {
  describe('isIsoDate', () => {
    it('accepts valid dates', () => {
      expect(isIsoDate('2026-12-01')).toBe(true);
    });

    it('rejects invalid dates', () => {
      expect(isIsoDate('2026-13-01')).toBe(false);
      expect(isIsoDate('01-12-2026')).toBe(false);
    });
  });

  describe('normalizeTaskInput', () => {
    it('normalizes valid payload', () => {
      const normalized = normalizeTaskInput({
        title: '  Build tests  ',
        description: '  Add coverage  ',
        dueDate: '2026-08-01',
        completed: false,
      });

      expect(normalized.ok).toBe(true);
      expect(normalized.task).toEqual({
        title: 'Build tests',
        description: 'Add coverage',
        dueDate: '2026-08-01',
        completed: false,
      });
    });

    it('rejects empty title', () => {
      const normalized = normalizeTaskInput({ title: '   ' });
      expect(normalized).toEqual({ ok: false, error: 'Task title is required' });
    });

    it('rejects invalid due date format', () => {
      const normalized = normalizeTaskInput({ title: 'Task', dueDate: '08/01/2026' });
      expect(normalized).toEqual({ ok: false, error: 'Due date must use YYYY-MM-DD format' });
    });
  });

  describe('parseTaskId', () => {
    it('accepts valid numeric ids', () => {
      expect(parseTaskId('12')).toEqual({ ok: true, id: 12 });
    });

    it('rejects invalid ids', () => {
      expect(parseTaskId('abc')).toEqual({ ok: false, error: 'Valid task ID is required' });
      expect(parseTaskId('-1')).toEqual({ ok: false, error: 'Valid task ID is required' });
    });
  });

  describe('normalizeStatusFilter', () => {
    it('maps unsupported filter to all', () => {
      expect(normalizeStatusFilter('anything')).toBe('all');
      expect(normalizeStatusFilter(undefined)).toBe('all');
    });

    it('supports active and completed', () => {
      expect(normalizeStatusFilter('active')).toBe('active');
      expect(normalizeStatusFilter('completed')).toBe('completed');
    });
  });
});