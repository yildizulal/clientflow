import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import axios from "axios";
import {
  Building2,
  Eye,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import api from "../services/api";
import type {
  Client,
  ClientFormData,
  ClientStatus,
  ClientsResponse,
} from "../types/client";

const emptyForm: ClientFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  status: "lead",
  notes: "",
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | ClientStatus
  >("all");

  const [form, setForm] = useState<ClientFormData>(emptyForm);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [editingClient, setEditingClient] =
    useState<Client | null>(null);

  const [deletingClient, setDeletingClient] =
    useState<Client | null>(null);

  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  const [toast, setToast] = useState("");

  // -------------------------------------------------------
  // Toast
  // -------------------------------------------------------

  const showToast = (message: string) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 3000);
  };

  // -------------------------------------------------------
  // Get Clients
  // -------------------------------------------------------

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<ClientsResponse>("/clients");

      setClients(response.data.clients);
    } catch (error) {
      console.error(error);
      setError("Clients could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // -------------------------------------------------------
  // Search + Filter
  // -------------------------------------------------------

  const filteredClients = useMemo(() => {
    const query = search.toLowerCase().trim();

    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(query) ||
        (client.email || "").toLowerCase().includes(query) ||
        (client.company || "").toLowerCase().includes(query) ||
        (client.phone || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  // -------------------------------------------------------
  // Create
  // -------------------------------------------------------

  const openCreateModal = () => {
    setForm(emptyForm);
    setError("");
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("/clients", form);

      setClients((current) => [
        response.data.client,
        ...current,
      ]);

      setForm(emptyForm);
      setIsCreateOpen(false);

      showToast("Client created successfully.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Client could not be created.",
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------
  // Edit
  // -------------------------------------------------------

  const openEditModal = (client: Client) => {
    setEditingClient(client);

    setForm({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      status: client.status,
      notes: client.notes || "",
    });

    setError("");
    setOpenMenu(null);
  };

  const closeEditModal = () => {
    setEditingClient(null);
    setForm(emptyForm);
    setError("");
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();

    if (!editingClient) return;

    try {
      setSubmitting(true);
      setError("");

      const response = await api.put(
        `/clients/${editingClient._id}`,
        form,
      );

      setClients((current) =>
        current.map((client) =>
          client._id === editingClient._id
            ? response.data.client
            : client,
        ),
      );

      closeEditModal();

      showToast("Client updated successfully.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Client could not be updated.",
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------
  // Delete
  // -------------------------------------------------------

  const handleDelete = async () => {
    if (!deletingClient) return;

    try {
      setSubmitting(true);

      await api.delete(`/clients/${deletingClient._id}`);

      setClients((current) =>
        current.filter(
          (client) =>
            client._id !== deletingClient._id,
        ),
      );

      setDeletingClient(null);

      showToast("Client deleted successfully.");
    } catch (error) {
      console.error(error);
      showToast("Client could not be deleted.");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------
  // Status Style
  // -------------------------------------------------------

  const statusStyle = (status: ClientStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

      case "inactive":
        return "bg-slate-100 text-slate-600 ring-slate-500/20";

      default:
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
    }
  };

  return (
    <>
      <div className="mx-auto max-w-[1500px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Workspace
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Clients
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your clients and customer relationships.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
          >
            <Plus size={18} />
            Add client
          </button>
        </div>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label="Total clients"
            value={clients.length}
          />

          <StatCard
            label="Active"
            value={
              clients.filter(
                (client) => client.status === "active",
              ).length
            }
          />

          <StatCard
            label="Leads"
            value={
              clients.filter(
                (client) => client.status === "lead",
              ).length
            }
          />

          <StatCard
            label="Inactive"
            value={
              clients.filter(
                (client) => client.status === "inactive",
              ).length
            }
          />
        </div>

        {/* =================================================
            CLIENT LIST
        ================================================= */}

        <div className="mt-6 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Search + filters */}

          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  "all",
                  "active",
                  "lead",
                  "inactive",
                ] as const
              ).map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(status)
                  }
                  className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium capitalize transition ${
                    statusFilter === status
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}

          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading clients...
                </p>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            /* Empty */
            <div className="flex min-h-80 flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Users size={24} />
              </div>

              <h2 className="mt-4 font-semibold text-slate-900">
                No clients found
              </h2>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Add your first client or change your search
                filters.
              </p>
            </div>
          ) : (
            <>
              {/* ============================================
                  DESKTOP TABLE
              ============================================ */}

              <div className="hidden overflow-visible md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                        <TableHeader>
                          Client
                        </TableHeader>

                        <TableHeader>
                          Contact
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

                        <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredClients.map((client) => (
                        <tr
                          key={client._id}
                          className="transition hover:bg-slate-50/80"
                        >
                          {/* Client */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <ClientAvatar
                                name={client.name}
                              />

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {client.name}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {client._id.slice(-8)}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}

                          <td className="px-6 py-5">
                            <div className="space-y-1.5">
                              {client.email ? (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Mail size={14} />
                                  {client.email}
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  —
                                </span>
                              )}

                              {client.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Phone size={14} />
                                  {client.phone}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Company */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Building2
                                size={15}
                                className="text-slate-400"
                              />

                              {client.company || "—"}
                            </div>
                          </td>

                          {/* Status */}

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyle(
                                client.status,
                              )}`}
                            >
                              {client.status}
                            </span>
                          </td>

                          {/* Date */}

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {formatDate(
                              client.createdAt,
                            )}
                          </td>

                          {/* Actions */}

                          <td className="relative px-6 py-5 text-right">
                            <button
                              onClick={() =>
                                setOpenMenu(
                                  openMenu ===
                                    client._id
                                    ? null
                                    : client._id,
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <MoreHorizontal
                                size={19}
                              />
                            </button>

                            {openMenu ===
                              client._id && (
                              <div className="absolute right-6 top-14 z-30 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                                <button
                                  onClick={() => {
                                    setSelectedClient(
                                      client,
                                    );
                                    setOpenMenu(
                                      null,
                                    );
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                                >
                                  <Eye size={15} />
                                  View
                                </button>

                                <button
                                  onClick={() =>
                                    openEditModal(
                                      client,
                                    )
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
                                >
                                  <Pencil
                                    size={15}
                                  />
                                  Edit
                                </button>

                                <button
                                  onClick={() => {
                                    setDeletingClient(
                                      client,
                                    );
                                    setOpenMenu(
                                      null,
                                    );
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2
                                    size={15}
                                  />
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ============================================
                  MOBILE CARDS
              ============================================ */}

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredClients.map((client) => (
                  <div
                    key={client._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <ClientAvatar
                          name={client.name}
                        />

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {client.name}
                          </p>

                          <p className="truncate text-sm text-slate-500">
                            {client.company ||
                              "No company"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyle(
                          client.status,
                        )}`}
                      >
                        {client.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="truncate">
                            {client.email}
                          </span>
                        </div>
                      )}

                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          {client.phone}
                        </div>
                      )}

                      <div className="text-xs text-slate-400">
                        Added{" "}
                        {formatDate(
                          client.createdAt,
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() =>
                          setSelectedClient(
                            client,
                          )
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                      >
                        <Eye size={14} />
                        View
                      </button>

                      <button
                        onClick={() =>
                          openEditModal(client)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          setDeletingClient(
                            client,
                          )
                        }
                        aria-label="Delete client"
                        className="flex items-center justify-center rounded-lg bg-red-50 px-4 py-2.5 text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===================================================
          CREATE MODAL
      =================================================== */}

      {isCreateOpen && (
        <ClientFormModal
          title="Add new client"
          description="Add a new client to your workspace."
          form={form}
          setForm={setForm}
          error={error}
          submitting={submitting}
          submitText="Create client"
          submittingText="Creating..."
          onSubmit={handleCreate}
          onClose={() => {
            setIsCreateOpen(false);
            setForm(emptyForm);
            setError("");
          }}
        />
      )}

      {/* ===================================================
          EDIT MODAL
      =================================================== */}

      {editingClient && (
        <ClientFormModal
          title="Edit client"
          description={`Update ${editingClient.name}'s information.`}
          form={form}
          setForm={setForm}
          error={error}
          submitting={submitting}
          submitText="Save changes"
          submittingText="Saving..."
          onSubmit={handleUpdate}
          onClose={closeEditModal}
        />
      )}

      {/* ===================================================
          VIEW MODAL
      =================================================== */}

      {selectedClient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-4">
                <ClientAvatar
                  name={selectedClient.name}
                  large
                />

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-slate-950">
                    {selectedClient.name}
                  </h2>

                  <p className="truncate text-sm text-slate-500">
                    {selectedClient.company ||
                      "No company"}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedClient(null)
                }
                className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <Detail
                label="Email"
                value={selectedClient.email}
              />

              <Detail
                label="Phone"
                value={selectedClient.phone}
              />

              <Detail
                label="Company"
                value={selectedClient.company}
              />

              <Detail
                label="Status"
                value={selectedClient.status}
              />

              <Detail
                label="Notes"
                value={selectedClient.notes}
              />

              <Detail
                label="Created"
                value={formatDate(
                  selectedClient.createdAt,
                )}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end sm:p-6">
              <button
                onClick={() =>
                  setSelectedClient(null)
                }
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={() => {
                  const client =
                    selectedClient;

                  setSelectedClient(null);
                  openEditModal(client);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Pencil size={16} />
                Edit client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deletingClient && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={21} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Delete client?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You're about to delete{" "}
              <strong className="text-slate-700">
                {deletingClient.name}
              </strong>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                disabled={submitting}
                onClick={() =>
                  setDeletingClient(null)
                }
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
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
                  : "Delete client"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          TOAST
      =================================================== */}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-medium text-white shadow-xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:translate-x-0">
          {toast}
        </div>
      )}
    </>
  );
}

/* =========================================================
   CLIENT FORM MODAL
========================================================= */

interface ClientFormModalProps {
  title: string;
  description: string;
  form: ClientFormData;
  setForm: React.Dispatch<
    React.SetStateAction<ClientFormData>
  >;
  error: string;
  submitting: boolean;
  submitText: string;
  submittingText: string;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}

function ClientFormModal({
  title,
  description,
  form,
  setForm,
  error,
  submitting,
  submitText,
  submittingText,
  onSubmit,
  onClose,
}: ClientFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:p-4">
      <div className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Client name">
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Marco Rossi"
                className={inputClass}
              />
            </FormField>

            <FormField label="Company">
              <input
                value={form.company}
                onChange={(e) =>
                  setForm({
                    ...form,
                    company: e.target.value,
                  })
                }
                placeholder="Rossi Digital"
                className={inputClass}
              />
            </FormField>

            <FormField label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="marco@company.com"
                className={inputClass}
              />
            </FormField>

            <FormField label="Phone">
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                placeholder="+39 333 123 4567"
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField label="Status">
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status:
                    e.target
                      .value as ClientStatus,
                })
              }
              className={inputClass}
            >
              <option value="lead">
                Lead
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </FormField>

          <FormField label="Notes">
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              placeholder="Add notes about this client..."
              className={`${inputClass} resize-none`}
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50";

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

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {value}
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
    <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function ClientAvatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
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
      className={`flex shrink-0 items-center justify-center bg-indigo-50 font-semibold text-indigo-700 ${
        large
          ? "h-12 w-12 rounded-2xl"
          : "h-10 w-10 rounded-xl"
      }`}
    >
      {initials || "C"}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-medium text-slate-700">
        {value || "—"}
      </p>
    </div>
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