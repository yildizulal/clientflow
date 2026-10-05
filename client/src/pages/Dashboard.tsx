import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  Plus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import type {
  Client,
  ClientsResponse,
} from "../types/client";

import type {
  Task,
  TasksResponse,
} from "../types/task";

export default function Dashboard() {
  const { user } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ------------------------------------------------
  // Fetch dashboard data
  // ------------------------------------------------

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [clientsResponse, tasksResponse] =
          await Promise.all([
            api.get<ClientsResponse>("/clients"),
            api.get<TasksResponse>("/tasks"),
          ]);

        setClients(clientsResponse.data.clients);
        setTasks(tasksResponse.data.tasks);
      } catch (error) {
        console.error(error);

        setError(
          "Dashboard data could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ------------------------------------------------
  // Statistics
  // ------------------------------------------------

  const activeClients = clients.filter(
    (client) => client.status === "active",
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  const openTasks = tasks.filter(
    (task) => task.status !== "completed",
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === "todo",
  ).length;

  const progressTasks = tasks.filter(
    (task) => task.status === "in-progress",
  ).length;

  // ------------------------------------------------
  // Recent clients
  // ------------------------------------------------

  const recentClients = useMemo(() => {
    return [...clients]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [clients]);

  // ------------------------------------------------
  // Upcoming tasks
  // ------------------------------------------------

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.status !== "completed" &&
          task.dueDate,
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() -
          new Date(b.dueDate!).getTime(),
      )
      .slice(0, 5);
  }, [tasks]);

  const firstName =
    user?.name?.split(" ")[0] || "there";

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />

          <p className="mt-4 text-sm text-slate-500">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* =============================================
          HEADER
      ============================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Welcome back, {firstName}
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Here's what's happening across your
            ClientFlow workspace today.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to="/clients"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Users size={17} />
            View clients
          </Link>

          <Link
            to="/tasks"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={17} />
            Manage tasks
          </Link>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =============================================
          KPI CARDS
      ============================================= */}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard
          title="Total clients"
          value={clients.length}
          description={`${activeClients} active`}
          icon={Users}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <KpiCard
          title="Open tasks"
          value={openTasks}
          description={`${progressTasks} in progress`}
          icon={ListTodo}
          iconClass="bg-amber-50 text-amber-600"
        />

        <KpiCard
          title="Completed"
          value={completedTasks}
          description="Completed tasks"
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          title="Active clients"
          value={activeClients}
          description={`${clients.length} total clients`}
          icon={Building2}
          iconClass="bg-sky-50 text-sky-600"
        />
      </div>

      {/* =============================================
          MAIN GRID
      ============================================= */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* -------------------------------------------
            TASK OVERVIEW
        ------------------------------------------- */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Task overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current progress across your tasks.
              </p>
            </div>

            <Link
              to="/tasks"
              className="shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <TaskOverviewCard
              title="To do"
              value={todoTasks}
              total={tasks.length}
              icon={Circle}
            />

            <TaskOverviewCard
              title="In progress"
              value={progressTasks}
              total={tasks.length}
              icon={Clock3}
            />

            <TaskOverviewCard
              title="Completed"
              value={completedTasks}
              total={tasks.length}
              icon={CheckCircle2}
            />
          </div>

          {/* Progress */}

          <div className="mt-7 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                Overall completion
              </p>

              <p className="text-sm font-bold text-slate-950">
                {calculateCompletion(
                  completedTasks,
                  tasks.length,
                )}
                %
              </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-950 transition-all duration-500"
                style={{
                  width: `${calculateCompletion(
                    completedTasks,
                    tasks.length,
                  )}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {completedTasks} of {tasks.length} tasks
              completed
            </p>
          </div>
        </section>

        {/* -------------------------------------------
            UPCOMING TASKS
        ------------------------------------------- */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Upcoming tasks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your nearest deadlines.
              </p>
            </div>

            <CalendarDays
              size={20}
              className="text-slate-400"
            />
          </div>

          <div className="mt-5">
            {upcomingTasks.length === 0 ? (
              <EmptyState
                title="No upcoming deadlines"
                description="Tasks with due dates will appear here."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Clock3
                        size={15}
                        className="text-slate-500"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {task.title}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>
                          {formatDate(task.dueDate!)}
                        </span>

                        {task.client && (
                          <>
                            <span>•</span>

                            <span className="truncate">
                              {task.client.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <PriorityDot
                      priority={task.priority}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =============================================
          RECENT CLIENTS
      ============================================= */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Recent clients
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The latest clients added to your workspace.
            </p>
          </div>

          <Link
            to="/clients"
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View all
            <ArrowRight size={15} />
          </Link>
        </div>

        {recentClients.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No clients yet"
              description="Your recently added clients will appear here."
            />
          </div>
        ) : (
          <>
            {/* Desktop */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 text-left">
                    <TableHeader>
                      Client
                    </TableHeader>

                    <TableHeader>
                      Company
                    </TableHeader>

                    <TableHeader>
                      Status
                    </TableHeader>

                    <TableHeader>
                      Added
                    </TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentClients.map((client) => (
                    <tr
                      key={client._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <ClientAvatar
                            name={client.name}
                          />

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">
                              {client.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {client.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {client.company || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <ClientStatus
                          status={client.status}
                        />
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(
                          client.createdAt,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}

            <div className="divide-y divide-slate-100 md:hidden">
              {recentClients.map((client) => (
                <div
                  key={client._id}
                  className="flex items-center gap-3 p-4"
                >
                  <ClientAvatar
                    name={client.name}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {client.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {client.company ||
                        client.email ||
                        "No company"}
                    </p>
                  </div>

                  <ClientStatus
                    status={client.status}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* =================================================
   KPI CARD
================================================= */

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Users;
  iconClass: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-3 truncate text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =================================================
   TASK OVERVIEW
================================================= */

function TaskOverviewCard({
  title,
  value,
  total,
  icon: Icon,
}: {
  title: string;
  value: number;
  total: number;
  icon: typeof Circle;
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round((value / total) * 100);

  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <Icon
          size={18}
          className="text-slate-500"
        />

        <span className="text-xs font-semibold text-slate-400">
          {percentage}%
        </span>
      </div>

      <p className="mt-5 text-2xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">
        {title}
      </p>
    </div>
  );
}

/* =================================================
   CLIENT
================================================= */

function ClientAvatar({
  name,
}: {
  name: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
      {initials || "C"}
    </div>
  );
}

function ClientStatus({
  status,
}: {
  status: Client["status"];
}) {
  const styles = {
    active:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

    lead:
      "bg-amber-50 text-amber-700 ring-amber-600/20",

    inactive:
      "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =================================================
   PRIORITY
================================================= */

function PriorityDot({
  priority,
}: {
  priority: Task["priority"];
}) {
  const styles = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-emerald-500",
  };

  return (
    <span
      title={`${priority} priority`}
      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${styles[priority]}`}
    />
  );
}

/* =================================================
   EMPTY
================================================= */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <ListTodo
          size={18}
          className="text-slate-400"
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function TableHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

/* =================================================
   HELPERS
================================================= */

function calculateCompletion(
  completed: number,
  total: number,
) {
  if (total === 0) return 0;

  return Math.round(
    (completed / total) * 100,
  );
}

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