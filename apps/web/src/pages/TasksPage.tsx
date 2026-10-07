import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/axios';
import { Task } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import TaskModal from '../components/TaskModal';
import ErrorMessage from '../components/ErrorMessage';
import { getApiErrorMessage } from '../lib/apiError';

type TaskGroup = {
  title: string;
  description: string;
  tasks: Task[];
  tone: 'danger' | 'neutral' | 'success';
};

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await api.get('/tasks', {
        params: { search, status, priority },
      });

      setTasks(res.data);
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          'Failed to load tasks. Please try again.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(fetchTasks, 300);

    return () => clearTimeout(timeoutId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority]);

  const toggleTaskStatus = async (task: Task) => {
    setError('');

    try {
      const newStatus =
        task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

      await api.put(`/tasks/${task.id}`, {
        status: newStatus,
      });

      fetchTasks();
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          'Failed to update task. Please try again.'
        )
      );
    }
  };

  const deleteTask = async (taskId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this task?'
    );

    if (!confirmed) return;

    setError('');

    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          'Failed to delete task. Please try again.'
        )
      );
    }
  };

  const openCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const getDateOnly = (date: Date) =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  const groupedTasks = useMemo<TaskGroup[]>(() => {
    const now = new Date();
    const today = getDateOnly(now);

    const overdue: Task[] = [];
    const todayTasks: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];

    tasks.forEach((task) => {
      if (task.status === 'COMPLETED') {
        completed.push(task);
        return;
      }

      if (!task.dueDate) {
        upcoming.push(task);
        return;
      }

      const due = getDateOnly(new Date(task.dueDate));

      if (due < today) {
        overdue.push(task);
      } else if (due === today) {
        todayTasks.push(task);
      } else {
        upcoming.push(task);
      }
    });

    const groups: TaskGroup[] = [
      {
        title: 'Overdue',
        description: 'Tasks that need your attention first.',
        tasks: overdue,
        tone: 'danger',
      },
      {
        title: 'Today',
        description: 'Your immediate priorities.',
        tasks: todayTasks,
        tone: 'neutral',
      },
      {
        title: 'Upcoming',
        description: 'What is coming next.',
        tasks: upcoming,
        tone: 'neutral',
      },
      {
        title: 'Completed',
        description: 'Recently finished work.',
        tasks: completed,
        tone: 'success',
      },
    ];

    return groups.filter((group) => group.tasks.length > 0);
  }, [tasks]);

  const completedCount = tasks.filter(
    (task) => task.status === 'COMPLETED'
  ).length;

  const overdueCount = groupedTasks.find(
    (group) => group.title === 'Overdue'
  )?.tasks.length ?? 0;

  return (
    <div className="space-y-7">
      {/* Page header */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Keep things moving
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Tasks
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            A clear view of what needs your attention.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateTask}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#2B2B2E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#35363A] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          <span className="text-lg font-light leading-none">+</span>
          New Task
        </button>
      </section>

      {/* Search and filters */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300/80 bg-white/70 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-300/50"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 rounded-xl border border-slate-300/80 bg-white/70 px-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-300/50"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-11 rounded-xl border border-slate-300/80 bg-white/70 px-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-300/50"
          >
            <option value="">All priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </section>

      {/* Small overview */}
      {!isLoading && tasks.length > 0 && (
        <section className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
          <span>
            <strong className="font-semibold text-slate-900">
              {tasks.length}
            </strong>{' '}
            {tasks.length === 1 ? 'task' : 'tasks'}
          </span>

          <span>
            <strong className="font-semibold text-slate-900">
              {completedCount}
            </strong>{' '}
            completed
          </span>

          {overdueCount > 0 && (
            <span className="text-[#C95D4D]">
              <strong className="font-semibold">
                {overdueCount}
              </strong>{' '}
              overdue
            </span>
          )}
        </section>
      )}

      <ErrorMessage message={error} />

      {isLoading ? (
        <LoadingSpinner />
      ) : tasks.length === 0 && !error ? (
        <EmptyState
          title="No tasks found"
          description={
            search || status || priority
              ? 'No tasks match your current search or filters.'
              : 'Create your first task and start moving your work forward.'
          }
          actionText="Create Task"
          onAction={openCreateTask}
        />
      ) : (
        <div className="space-y-7">
          {groupedTasks.map((group) => (
            <section key={group.title}>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-950">
                      {group.title}
                    </h2>

                    <span
                      className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        group.tone === 'danger'
                          ? 'bg-[#FDEBE7] text-[#B94E3F]'
                          : group.tone === 'success'
                            ? 'bg-[#E8F4EA] text-[#477956]'
                            : 'bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {group.tasks.length}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {group.description}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 shadow-sm backdrop-blur-xl">
                <ul className="divide-y divide-slate-200/80">
                  {group.tasks.map((task) => {
                    const isCompleted =
                      task.status === 'COMPLETED';

                    const isOverdue =
                      !isCompleted &&
                      !!task.dueDate &&
                      getDateOnly(new Date(task.dueDate)) <
                        getDateOnly(new Date());

                    return (
                      <li
                        key={task.id}
                        className="group flex flex-col gap-4 p-4 transition hover:bg-white/90 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-4">
                          <button
                            type="button"
                            aria-label={
                              isCompleted
                                ? `Mark ${task.name} as pending`
                                : `Mark ${task.name} as completed`
                            }
                            onClick={() => toggleTaskStatus(task)}
                            className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 ${
                              isCompleted
                                ? 'border-[#8BC49A] bg-[#8BC49A] text-white'
                                : 'border-slate-300 bg-white text-transparent hover:border-slate-500'
                            }`}
                          >
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              className="h-4 w-4"
                            >
                              <path d="m5 12 4 4L19 6" />
                            </svg>
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className={`text-sm font-semibold sm:text-[15px] ${
                                  isCompleted
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-950'
                                }`}
                              >
                                {task.name}
                              </h3>

                              {isOverdue && (
                                <span className="rounded-full bg-[#FDEBE7] px-2 py-0.5 text-[11px] font-semibold text-[#B94E3F]">
                                  Overdue
                                </span>
                              )}
                            </div>

                            {task.description && (
                              <p
                                className={`mt-1 max-w-3xl text-sm leading-5 ${
                                  isCompleted
                                    ? 'text-slate-400'
                                    : 'text-slate-500'
                                }`}
                              >
                                {task.description}
                              </p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {task.project && (
                                <span className="inline-flex items-center rounded-full bg-[#E8F2F8] px-2.5 py-1 text-xs font-medium text-[#3E6D88]">
                                  {task.project.name}
                                </span>
                              )}

                              <StatusBadge status={task.priority} />

                              <StatusBadge status={task.status} />

                              {task.dueDate && (
                                <span
                                  className={`text-xs ${
                                    isOverdue
                                      ? 'font-medium text-[#B94E3F]'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {isOverdue ? 'Overdue Â· ' : 'Due Â· '}
                                  {formatDate(task.dueDate)}
                                </span>
                              )}

                              {!task.dueDate && (
                                <span className="text-xs text-slate-400">
                                  No due date
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-shrink-0 items-center gap-2 pl-10 sm:pl-0">
                          <button
                            type="button"
                            aria-label={`Edit ${task.name}`}
                            onClick={() => openEditTask(task)}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            aria-label={`Delete ${task.name}`}
                            onClick={() => deleteTask(task.id)}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#F2D1CB] bg-[#FFF7F5] px-3 text-xs font-semibold text-[#B94E3F] transition hover:bg-[#FDEBE7] focus:outline-none focus:ring-2 focus:ring-[#F1B8AD]"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSave={() => {
            setShowTaskModal(false);
            fetchTasks();
          }}
          task={editingTask}
        />
      )}
    </div>
  );
};

export default TasksPage;
