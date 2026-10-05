import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import axios from "axios";

import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import api from "../services/api";

import type {
  Task,
  TaskFormData,
  TaskPriority,
  TaskStatus,
  TasksResponse,
} from "../types/task";

import type {
  Client,
  ClientsResponse,
} from "../types/client";

const emptyForm: TaskFormData = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  client: "",
};

const columns: {
  status: TaskStatus;
  title: string;
  icon: typeof Circle;
}[] = [
  {
    status: "todo",
    title: "To do",
    icon: Circle,
  },
  {
    status: "in-progress",
    title: "In progress",
    icon: Clock3,
  },
  {
    status: "completed",
    title: "Completed",
    icon: CheckCircle2,
  },
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");

  const [priorityFilter, setPriorityFilter] =
    useState<"all" | TaskPriority>("all");

  const [mobileStatus, setMobileStatus] =
    useState<TaskStatus>("todo");

  const [form, setForm] =
    useState<TaskFormData>(emptyForm);

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [deletingTask, setDeletingTask] =
    useState<Task | null>(null);

  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // ------------------------------------------------
  // Toast
  // ------------------------------------------------

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 3000);
  };

  // ------------------------------------------------
  // Load data
  // ------------------------------------------------

  const fetchData = async () => {
    try {
      setLoading(true);

      const [tasksResponse, clientsResponse] =
        await Promise.all([
          api.get<TasksResponse>("/tasks"),
          api.get<ClientsResponse>("/clients"),
        ]);

      setTasks(tasksResponse.data.tasks);
      setClients(clientsResponse.data.clients);
    } catch (error) {
      console.error(error);
      setError("Tasks could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ------------------------------------------------
  // Filtering
  // ------------------------------------------------

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        (task.description || "")
          .toLowerCase()
          .includes(query) ||
        (task.client?.name || "")
          .toLowerCase()
          .includes(query) ||
        (task.client?.company || "")
          .toLowerCase()
          .includes(query);

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [tasks, search, priorityFilter]);

  const tasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter(
      (task) => task.status === status,
    );

  // ------------------------------------------------
  // Create
  // ------------------------------------------------

  const openCreateModal = (
    status: TaskStatus = "todo",
  ) => {
    setForm({
      ...emptyForm,
      status,
    });

    setError("");
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        ...form,
        client: form.client || null,
        dueDate: form.dueDate || null,
      };

      const response = await api.post(
        "/tasks",
        payload,
      );

      setTasks((current) => [
        response.data.task,
        ...current,
      ]);

      setForm(emptyForm);
      setIsCreateOpen(false);

      showToast("Task created successfully.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Task could not be created.",
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------
  // Edit
  // ------------------------------------------------

  const openEditModal = (task: Task) => {
    setEditingTask(task);

    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
        ? task.dueDate.slice(0, 10)
        : "",
      client: task.client?._id || "",
    });

    setError("");
    setOpenMenu(null);
  };

  const closeEditModal = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setError("");
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();

    if (!editingTask) return;

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        ...form,
        client: form.client || null,
        dueDate: form.dueDate || null,
      };

      const response = await api.put(
        `/tasks/${editingTask._id}`,
        payload,
      );

      setTasks((current) =>
        current.map((task) =>
          task._id === editingTask._id
            ? response.data.task
            : task,
        ),
      );

      closeEditModal();

      showToast("Task updated successfully.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Task could not be updated.",
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------
  // Quick status update
  // ------------------------------------------------

  const updateStatus = async (
    task: Task,
    status: TaskStatus,
  ) => {
    if (task.status === status) return;

    try {
      const response = await api.put(
        `/tasks/${task._id}`,
        {
          status,
        },
      );

      setTasks((current) =>
        current.map((currentTask) =>
          currentTask._id === task._id
            ? response.data.task
            : currentTask,
        ),
      );

      showToast("Task status updated.");
    } catch (error) {
      console.error(error);
      showToast("Task status could not be updated.");
    }
  };

  // ------------------------------------------------
  // Delete
  // ------------------------------------------------

  const handleDelete = async () => {
    if (!deletingTask) return;

    try {
      setSubmitting(true);

      await api.delete(
        `/tasks/${deletingTask._id}`,
      );

      setTasks((current) =>
        current.filter(
          (task) =>
            task._id !== deletingTask._id,
        ),
      );

      setDeletingTask(null);

      showToast("Task deleted successfully.");
    } catch (error) {
      console.error(error);
      showToast("Task could not be deleted.");
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------
  // Counts
  // ------------------------------------------------

  const todoCount = tasks.filter(
    (task) => task.status === "todo",
  ).length;

  const progressCount = tasks.filter(
    (task) => task.status === "in-progress",
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  return (
    <>
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Workspace
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Tasks
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Organize, prioritize and track your work.
            </p>
          </div>

          <button
            onClick={() =>
              openCreateModal("todo")
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
          >
            <Plus size={18} />
            Add task
          </button>
        </div>

        {/* STATS */}

        <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            label="Total tasks"
            value={tasks.length}
          />

          <StatCard
            label="To do"
            value={todoCount}
          />

          <StatCard
            label="In progress"
            value={progressCount}
          />

          <StatCard
            label="Completed"
            value={completedCount}
          />
        </div>

        {/* FILTERS */}

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search tasks or clients..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(
              [
                "all",
                "high",
                "medium",
                "low",
              ] as const
            ).map((priority) => (
              <button
                key={priority}
                onClick={() =>
                  setPriorityFilter(priority)
                }
                className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium capitalize transition ${
                  priorityFilter === priority
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="mt-6 flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

              <p className="mt-4 text-sm text-slate-500">
                Loading tasks...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* =====================================
                DESKTOP KANBAN
            ===================================== */}

            <div className="mt-6 hidden grid-cols-3 gap-5 lg:grid">
              {columns.map((column) => {
                const columnTasks =
                  tasksByStatus(column.status);

                return (
                  <KanbanColumn
                    key={column.status}
                    title={column.title}
                    status={column.status}
                    count={columnTasks.length}
                    icon={column.icon}
                    onAdd={() =>
                      openCreateModal(
                        column.status,
                      )
                    }
                  >
                    {columnTasks.length === 0 ? (
                      <EmptyColumn />
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task._id}
                          task={task}
                          openMenu={openMenu}
                          setOpenMenu={setOpenMenu}
                          onEdit={() =>
                            openEditModal(task)
                          }
                          onDelete={() => {
                            setDeletingTask(
                              task,
                            );
                            setOpenMenu(null);
                          }}
                          onStatusChange={(
                            status,
                          ) =>
                            updateStatus(
                              task,
                              status,
                            )
                          }
                        />
                      ))
                    )}
                  </KanbanColumn>
                );
              })}
            </div>

            {/* =====================================
                MOBILE + TABLET
            ===================================== */}

            <div className="mt-6 lg:hidden">
              <div className="flex gap-2 overflow-x-auto pb-3">
                {columns.map((column) => (
                  <button
                    key={column.status}
                    onClick={() =>
                      setMobileStatus(
                        column.status,
                      )
                    }
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      mobileStatus ===
                      column.status
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {column.title}{" "}
                    <span className="ml-1 opacity-60">
                      {
                        tasksByStatus(
                          column.status,
                        ).length
                      }
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-2 space-y-3">
                {tasksByStatus(
                  mobileStatus,
                ).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <p className="text-sm text-slate-500">
                      No tasks in this section.
                    </p>

                    <button
                      onClick={() =>
                        openCreateModal(
                          mobileStatus,
                        )
                      }
                      className="mt-4 text-sm font-semibold text-indigo-600"
                    >
                      + Add task
                    </button>
                  </div>
                ) : (
                  tasksByStatus(
                    mobileStatus,
                  ).map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      openMenu={openMenu}
                      setOpenMenu={
                        setOpenMenu
                      }
                      onEdit={() =>
                        openEditModal(task)
                      }
                      onDelete={() => {
                        setDeletingTask(task);
                        setOpenMenu(null);
                      }}
                      onStatusChange={(
                        status,
                      ) =>
                        updateStatus(
                          task,
                          status,
                        )
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* CREATE MODAL */}

      {isCreateOpen && (
        <TaskFormModal
          title="Create new task"
          description="Add a new task to your workspace."
          form={form}
          setForm={setForm}
          clients={clients}
          error={error}
          submitting={submitting}
          submitText="Create task"
          submittingText="Creating..."
          onSubmit={handleCreate}
          onClose={() => {
            setIsCreateOpen(false);
            setForm(emptyForm);
            setError("");
          }}
        />
      )}

      {/* EDIT MODAL */}

      {editingTask && (
        <TaskFormModal
          title="Edit task"
          description={`Update "${editingTask.title}".`}
          form={form}
          setForm={setForm}
          clients={clients}
          error={error}
          submitting={submitting}
          submitText="Save changes"
          submittingText="Saving..."
          onSubmit={handleUpdate}
          onClose={closeEditModal}
        />
      )}

      {/* DELETE MODAL */}

      {deletingTask && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={21} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Delete task?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You're about to delete{" "}
              <strong className="text-slate-700">
                {deletingTask.title}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                disabled={submitting}
                onClick={() =>
                  setDeletingTask(null)
                }
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                disabled={submitting}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {submitting
                  ? "Deleting..."
                  : "Delete task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-medium text-white shadow-xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:translate-x-0">
          {toast}
        </div>
      )}
    </>
  );
}

/* ========================================================
   TASK CARD
======================================================== */

interface TaskCardProps {
  task: Task;
  openMenu: string | null;
  setOpenMenu: (
    value: string | null,
  ) => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (
    status: TaskStatus,
  ) => void;
}

function TaskCard({
  task,
  openMenu,
  setOpenMenu,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  return (
    <article className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <PriorityBadge
          priority={task.priority}
        />

        <div className="relative">
          <button
            onClick={() =>
              setOpenMenu(
                openMenu === task._id
                  ? null
                  : task._id,
              )
            }
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <MoreHorizontal size={18} />
          </button>

          {openMenu === task._id && (
            <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <button
                onClick={onEdit}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                <Pencil size={15} />
                Edit
              </button>

              <button
                onClick={onDelete}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="mt-4 font-semibold leading-6 text-slate-900">
        {task.title}
      </h3>

      {task.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {task.description}
        </p>
      )}

      <div className="mt-5 space-y-2">
        {task.client && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <UserRound
              size={14}
              className="text-slate-400"
            />

            <span className="truncate">
              {task.client.name}
            </span>
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays
              size={14}
              className="text-slate-400"
            />

            {formatDate(task.dueDate)}
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <select
          value={task.status}
          onChange={(e) =>
            onStatusChange(
              e.target.value as TaskStatus,
            )
          }
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 outline-none transition focus:border-indigo-300"
        >
          <option value="todo">
            To do
          </option>

          <option value="in-progress">
            In progress
          </option>

          <option value="completed">
            Completed
          </option>
        </select>
      </div>
    </article>
  );
}

/* ========================================================
   KANBAN COLUMN
======================================================== */

function KanbanColumn({
  title,
  status,
  count,
  icon: Icon,
  onAdd,
  children,
}: {
  title: string;
  status: TaskStatus;
  count: number;
  icon: typeof Circle;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-2xl bg-slate-100/70 p-3">
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2">
          <Icon
            size={17}
            className={
              status === "completed"
                ? "text-emerald-600"
                : status === "in-progress"
                  ? "text-indigo-600"
                  : "text-slate-500"
            }
          />

          <h2 className="text-sm font-bold text-slate-800">
            {title}
          </h2>

          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
            {count}
          </span>
        </div>

        <button
          onClick={onAdd}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-950"
        >
          <Plus size={17} />
        </button>
      </div>

      <div className="mt-2 space-y-3">
        {children}
      </div>
    </section>
  );
}

/* ========================================================
   TASK FORM MODAL
======================================================== */

function TaskFormModal({
  title,
  description,
  form,
  setForm,
  clients,
  error,
  submitting,
  submitText,
  submittingText,
  onSubmit,
  onClose,
}: {
  title: string;
  description: string;
  form: TaskFormData;
  setForm: React.Dispatch<
    React.SetStateAction<TaskFormData>
  >;
  clients: Client[];
  error: string;
  submitting: boolean;
  submitText: string;
  submittingText: string;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:p-4">
      <div className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <FormField label="Task title">
            <input
              required
              maxLength={150}
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="Prepare project proposal"
              className={inputClass}
            />
          </FormField>

          <FormField label="Description">
            <textarea
              rows={4}
              maxLength={1000}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
              placeholder="Add task details..."
              className={`${inputClass} resize-none`}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Status">
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status:
                      e.target
                        .value as TaskStatus,
                  })
                }
                className={inputClass}
              >
                <option value="todo">
                  To do
                </option>

                <option value="in-progress">
                  In progress
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>
            </FormField>

            <FormField label="Priority">
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority:
                      e.target
                        .value as TaskPriority,
                  })
                }
                className={inputClass}
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>
              </select>
            </FormField>

            <FormField label="Client">
              <select
                value={form.client}
                onChange={(e) =>
                  setForm({
                    ...form,
                    client:
                      e.target.value,
                  })
                }
                className={inputClass}
              >
                <option value="">
                  No client
                </option>

                {clients.map((client) => (
                  <option
                    key={client._id}
                    value={client._id}
                  >
                    {client.name}
                    {client.company
                      ? ` — ${client.company}`
                      : ""}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Due date">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dueDate:
                      e.target.value,
                  })
                }
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting
                ? submittingText
                : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========================================================
   HELPERS
======================================================== */

function PriorityBadge({
  priority,
}: {
  priority: TaskPriority;
}) {
  const styles = {
    high: "bg-red-50 text-red-700 ring-red-600/20",
    medium:
      "bg-amber-50 text-amber-700 ring-amber-600/20",
    low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function EmptyColumn() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-7 text-center">
      <p className="text-xs text-slate-400">
        No tasks here
      </p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}