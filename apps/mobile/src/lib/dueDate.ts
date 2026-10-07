// Date-only input is stored at midnight UTC so the calendar date stays consistent.
export function parseDueDate(value: string): string | null {
  const date = value.trim();
  if (!date) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Enter a valid due date in YYYY-MM-DD format.');
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error('Enter a valid due date in YYYY-MM-DD format.');
  }
  return parsed.toISOString();
}

export function dueDateInput(value?: string | null): string {
  return value ? value.slice(0, 10) : '';
}
