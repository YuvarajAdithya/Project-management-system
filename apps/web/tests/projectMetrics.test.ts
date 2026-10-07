import test from 'node:test';
import assert from 'node:assert/strict';
import type { Task } from '../src/types/index.ts';
import { completionPercent, daysUntil, deadlineHealth, focusTasks, upcomingTasks, projectProgress, formatDate } from '../src/lib/projectMetrics.ts';

const now = new Date(2026, 9, 7, 18, 30);
const task = (id: string, overrides: Partial<Task> = {}): Task => ({ id, projectId: 'p1', name: id, status: 'PENDING', priority: 'MEDIUM', createdAt: '2026-10-01', updatedAt: '2026-10-01', ...overrides });

test('zero tasks and per-project completion produce honest progress', () => {
  assert.equal(completionPercent(0, 0), 0);
  assert.equal(completionPercent(1, 3), 33);
  assert.deepEqual(projectProgress('p1', [task('done', { status: 'COMPLETED' }), task('open'), task('other', { projectId: 'p2', status: 'COMPLETED' })]), { completed: 1, total: 2, percent: 50 });
  assert.deepEqual(projectProgress('empty', []), { completed: 0, total: 0, percent: 0 });
});

test('deadline health handles today, the three-day boundary, missing dates and completion', () => {
  assert.equal(daysUntil('2026-10-07T00:00:00Z', now), 0);
  assert.equal(deadlineHealth({ status: 'IN_PROGRESS', endDate: '2026-10-06' }, now).label, 'Overdue');
  assert.equal(deadlineHealth({ status: 'IN_PROGRESS', endDate: '2026-10-07' }, now).label, 'Due today');
  assert.equal(deadlineHealth({ status: 'NOT_STARTED', endDate: '2026-10-10' }, now).label, 'Due soon');
  assert.equal(deadlineHealth({ status: 'NOT_STARTED', endDate: '2026-10-11' }, now).label, 'On track');
  assert.equal(deadlineHealth({ status: 'COMPLETED', endDate: '2025-01-01' }, now).label, 'Completed');
  assert.equal(deadlineHealth({ status: 'NOT_STARTED' }, now).label, 'No deadline');
  assert.equal(daysUntil('invalid', now), null);
  assert.equal(formatDate(undefined), 'Not set');
});

test('focus prioritizes overdue before today before high priority, excludes completed, and never mutates data', () => {
  const tasks = [task('future', { priority: 'HIGH', dueDate: '2026-10-09' }), task('today', { dueDate: '2026-10-07' }), task('overdue', { dueDate: '2026-10-05' }), task('done', { status: 'COMPLETED', dueDate: '2026-10-01' }), task('later', { dueDate: '2026-10-11' }), task('undated')];
  const original = tasks.map(task => task.id);
  assert.deepEqual(focusTasks(tasks, now).map(task => task.id), ['overdue', 'today', 'future']);
  assert.deepEqual(upcomingTasks(tasks, now).map(task => task.id), ['today', 'future', 'later']);
  assert.deepEqual(tasks.map(task => task.id), original);
});
