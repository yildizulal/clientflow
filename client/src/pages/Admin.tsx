import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ListTodo,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  UserCheck,
  Building2,
} from "lucide-react";

import api from "../services/api";

interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalTasks: number;
  completedTasks: number;
  activeClients: number;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

interface StatsResponse {
  success: boolean;
  stats: AdminStats;
}

interface UsersResponse {
  success: boolean;
  count: number;
  users: AdminUser[];
}

export default function Admin() {
  const [stats, setStats] =
    useState<AdminStats | null>(null);

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState<"all" | "user" | "admin">(
      "all",
    );

  // -----------------------------------------------
  // Fetch admin data
  // -----------------------------------------------

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          statsResponse,
          usersResponse,
        ] = await Promise.all([
          api.get<StatsResponse>(
            "/admin/stats",
          ),

          api.get<UsersResponse>(
            "/admin/users",
          ),
        ]);

        setStats(
          statsResponse.data.stats,
        );

        setUsers(
          usersResponse.data.users,
        );
      } catch (error) {
        console.error(error);

        setError(
          "Admin data could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // -----------------------------------------------
  // Filter users
  // -----------------------------------------------

  const filteredUsers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const matchesSearch =
            user.name
              .toLowerCase()
              .includes(query) ||
            user.email
              .toLowerCase()
              .includes(query);

          const matchesRole =
            roleFilter === "all" ||
            user.role ===
              roleFilter;

          return (
            matchesSearch &&
            matchesRole
          );
        },
      );
    }, [
      users,
      search,
      roleFilter,
    ]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />

          <p className="mt-4 text-sm text-slate-500">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* =========================================
          HEADER
      ========================================= */}

      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <ShieldCheck size={17} />
          Administration
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Admin Panel
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Monitor platform activity,
          users and workspace data.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =========================================
          STATS
      ========================================= */}

      {stats && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
          <AdminStatCard
            title="Users"
            value={stats.totalUsers}
            icon={Users}
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <AdminStatCard
            title="Clients"
            value={
              stats.totalClients
            }
            icon={Building2}
            iconClass="bg-sky-50 text-sky-600"
          />

          <AdminStatCard
            title="Tasks"
            value={stats.totalTasks}
            icon={ListTodo}
            iconClass="bg-amber-50 text-amber-600"
          />

          <AdminStatCard
            title="Completed"
            value={
              stats.completedTasks
            }
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <AdminStatCard
            title="Active clients"
            value={
              stats.activeClients
            }
            icon={UserCheck}
            iconClass="bg-violet-50 text-violet-600"
          />
        </div>
      )}

      {/* =========================================
          USER MANAGEMENT
      ========================================= */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View registered ClientFlow
              accounts and roles.
            </p>
          </div>

          {/* Search / Filter */}

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Search users..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div className="flex gap-2">
              {(
                [
                  "all",
                  "user",
                  "admin",
                ] as const
              ).map((role) => (
                <button
                  key={role}
                  onClick={() =>
                    setRoleFilter(role)
                  }
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium capitalize transition ${
                    roleFilter ===
                    role
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredUsers.length ===
        0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Users
                size={20}
                className="text-slate-400"
              />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              No users found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try changing your
              search or role filter.
            </p>
          </div>
        ) : (
          <>
            {/* ===================================
                DESKTOP TABLE
            =================================== */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80 text-left">
                    <TableHeader>
                      User
                    </TableHeader>

                    <TableHeader>
                      Role
                    </TableHeader>

                    <TableHeader>
                      Joined
                    </TableHeader>

                    <TableHeader>
                      Account ID
                    </TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(
                    (user) => (
                      <tr
                        key={user._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={
                                user.name
                              }
                              role={
                                user.role
                              }
                            />

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {
                                  user.name
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {
                                  user.email
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <RoleBadge
                            role={
                              user.role
                            }
                          />
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(
                            user.createdAt,
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-500">
                            {user._id.slice(
                              -8,
                            )}
                          </code>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* ===================================
                MOBILE
            =================================== */}

            <div className="divide-y divide-slate-100 md:hidden">
              {filteredUsers.map(
                (user) => (
                  <div
                    key={user._id}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        name={
                          user.name
                        }
                        role={
                          user.role
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {
                                user.name
                              }
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {
                                user.email
                              }
                            </p>
                          </div>

                          <RoleBadge
                            role={
                              user.role
                            }
                          />
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                          Joined{" "}
                          {formatDate(
                            user.createdAt,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

/* ===============================================
   STAT CARD
=============================================== */

function AdminStatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: number;
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

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

/* ===============================================
   USER AVATAR
=============================================== */

function UserAvatar({
  name,
  role,
}: {
  name: string;
  role: "user" | "admin";
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
        role === "admin"
          ? "bg-indigo-50 text-indigo-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {initials || (
        <UserRound size={17} />
      )}
    </div>
  );
}

/* ===============================================
   ROLE BADGE
=============================================== */

function RoleBadge({
  role,
}: {
  role: "user" | "admin";
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${
        role === "admin"
          ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
          : "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      {role === "admin" && (
        <ShieldCheck size={12} />
      )}

      {role}
    </span>
  );
}

/* ===============================================
   TABLE HEADER
=============================================== */

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function formatDate(date: string) {
  return new Date(
    date,
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}