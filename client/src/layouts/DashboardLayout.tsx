import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ListTodo,
  ShieldCheck,
  LogOut,
  Workflow,
  Menu,
  X,
  UserCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-slate-950 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    }`;

  const closeSidebar = () => setSidebarOpen(false);

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <Workflow size={20} />
          </div>

          <div>
            <h1 className="font-bold text-slate-950">ClientFlow</h1>
            <p className="text-xs text-slate-400">Workspace</p>
          </div>
        </div>

        <button
          onClick={closeSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="mt-10 space-y-2">
        <NavLink
          to="/dashboard"
          end
          className={linkClass}
          onClick={closeSidebar}
        >
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        <NavLink
          to="/clients"
          className={linkClass}
          onClick={closeSidebar}
        >
          <Users size={19} />
          Clients
        </NavLink>

        <NavLink
          to="/tasks"
          className={linkClass}
          onClick={closeSidebar}
        >
          <ListTodo size={19} />
          Tasks
        </NavLink>

        <NavLink
          to="/profile"
          className={linkClass}
          onClick={closeSidebar}
        >
          <UserCircle size={19} />
          Profile
        </NavLink>

        {user?.role === "admin" && (
          <NavLink
            to="/admin"
            className={linkClass}
            onClick={closeSidebar}
          >
            <ShieldCheck size={19} />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-5">
        <NavLink
          to="/profile"
          onClick={closeSidebar}
          className="mb-4 block rounded-xl px-2 py-2 transition hover:bg-slate-50"
        >
          <p className="truncate text-sm font-semibold text-slate-900">
            {user?.name}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-500">
            {user?.email}
          </p>
        </NavLink>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white p-5 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close menu"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white p-5 shadow-2xl transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-700"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <Workflow size={19} />
          <span className="font-bold text-slate-950">ClientFlow</span>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
          {user?.name
            ?.split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
      </header>

      <main className="min-h-screen p-4 sm:p-6 lg:ml-64 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}