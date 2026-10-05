import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import axios from "axios";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const {
    user,
    updateUser,
  } = useAuth();

  const [profileForm, setProfileForm] =
    useState({
      name: "",
      email: "",
    });

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [
    profileSubmitting,
    setProfileSubmitting,
  ] = useState(false);

  const [
    passwordSubmitting,
    setPasswordSubmitting,
  ] = useState(false);

  const [profileError, setProfileError] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [toast, setToast] =
    useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  // ---------------------------------------------
  // Load current user
  // ---------------------------------------------

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      name: user.name,
      email: user.email,
    });
  }, [user]);

  if (!user) return null;

  // ---------------------------------------------
  // Toast
  // ---------------------------------------------

  const showToast = (
    message: string,
  ) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 3000);
  };

  // ---------------------------------------------
  // Update profile
  // ---------------------------------------------

  const handleProfileUpdate = async (
    e: FormEvent,
  ) => {
    e.preventDefault();

    if (
      !profileForm.name.trim() ||
      !profileForm.email.trim()
    ) {
      setProfileError(
        "Name and email are required.",
      );

      return;
    }

    try {
      setProfileSubmitting(true);
      setProfileError("");

      const response = await api.put(
        "/auth/profile",
        {
          name: profileForm.name,
          email: profileForm.email,
        },
      );

      updateUser(
        response.data.user,
      );

      showToast(
        "Profile updated successfully.",
      );
    } catch (error) {
      if (
        axios.isAxiosError(error)
      ) {
        setProfileError(
          error.response?.data
            ?.message ||
            "Profile could not be updated.",
        );
      } else {
        setProfileError(
          "Something went wrong.",
        );
      }
    } finally {
      setProfileSubmitting(false);
    }
  };

  // ---------------------------------------------
  // Change password
  // ---------------------------------------------

  const handlePasswordChange = async (
    e: FormEvent,
  ) => {
    e.preventDefault();

    setPasswordError("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError(
        "Please complete all password fields.",
      );

      return;
    }

    if (
      passwordForm.newPassword
        .length < 6
    ) {
      setPasswordError(
        "New password must be at least 6 characters.",
      );

      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New passwords do not match.",
      );

      return;
    }

    try {
      setPasswordSubmitting(true);

      await api.put(
        "/auth/password",
        {
          currentPassword:
            passwordForm.currentPassword,

          newPassword:
            passwordForm.newPassword,
        },
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showToast(
        "Password changed successfully.",
      );
    } catch (error) {
      if (
        axios.isAxiosError(error)
      ) {
        setPasswordError(
          error.response?.data
            ?.message ||
            "Password could not be changed.",
        );
      } else {
        setPasswordError(
          "Something went wrong.",
        );
      }
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <div className="mx-auto max-w-[1200px]">
        {/* HEADER */}

        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Account
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Profile & Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your account information
            and security settings.
          </p>
        </div>

        {/* PROFILE HERO */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-slate-950 via-slate-800 to-indigo-950 sm:h-36" />

          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-indigo-50 text-2xl font-bold text-indigo-700 shadow-sm sm:h-24 sm:w-24">
                  {initials || (
                    <UserRound
                      size={28}
                    />
                  )}
                </div>

                <div className="pb-1">
                  <h2 className="text-xl font-bold text-slate-950 sm:text-2xl md:mt-20">
                    {user.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <RoleBadge
                role={user.role}
              />
            </div>
          </div>
        </section>

        {/* FORMS */}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {/* ACCOUNT DETAILS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <UserRound size={20} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-950">
              Personal information
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Update your name and email
              address.
            </p>

            <form
              onSubmit={
                handleProfileUpdate
              }
              className="mt-6 space-y-5"
            >
              {profileError && (
                <ErrorMessage>
                  {profileError}
                </ErrorMessage>
              )}

              <FormField label="Full name">
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    required
                    maxLength={50}
                    value={
                      profileForm.name
                    }
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        name:
                          e.target.value,
                      })
                    }
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </FormField>

              <FormField label="Email address">
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    required
                    type="email"
                    value={
                      profileForm.email
                    }
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        email:
                          e.target.value,
                      })
                    }
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </FormField>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={
                    profileSubmitting
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <Save size={16} />

                  {profileSubmitting
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            </form>
          </section>

          {/* PASSWORD */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <KeyRound size={20} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-950">
              Password & security
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Change your password using
              your current credentials.
            </p>

            <form
              onSubmit={
                handlePasswordChange
              }
              className="mt-6 space-y-5"
            >
              {passwordError && (
                <ErrorMessage>
                  {passwordError}
                </ErrorMessage>
              )}

              <FormField label="Current password">
                <PasswordInput
                  value={
                    passwordForm.currentPassword
                  }
                  show={
                    showCurrentPassword
                  }
                  onToggle={() =>
                    setShowCurrentPassword(
                      (current) =>
                        !current,
                    )
                  }
                  onChange={(value) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword:
                        value,
                    })
                  }
                />
              </FormField>

              <FormField label="New password">
                <PasswordInput
                  value={
                    passwordForm.newPassword
                  }
                  show={showNewPassword}
                  onToggle={() =>
                    setShowNewPassword(
                      (current) =>
                        !current,
                    )
                  }
                  onChange={(value) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword:
                        value,
                    })
                  }
                />
              </FormField>

              <FormField label="Confirm new password">
                <PasswordInput
                  value={
                    passwordForm.confirmPassword
                  }
                  show={showNewPassword}
                  onToggle={() =>
                    setShowNewPassword(
                      (current) =>
                        !current,
                    )
                  }
                  onChange={(value) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword:
                        value,
                    })
                  }
                />
              </FormField>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={
                    passwordSubmitting
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <LockKeyhole
                    size={16}
                  />

                  {passwordSubmitting
                    ? "Updating..."
                    : "Change password"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* SECURITY INFO */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-slate-900">
                Account secured
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Your ClientFlow account
                uses JWT authentication and
                hashed passwords.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-medium text-white shadow-xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:translate-x-0">
          {toast}
        </div>
      )}
    </>
  );
}

// ======================================================
// PASSWORD INPUT
// ======================================================

function PasswordInput({
  value,
  show,
  onToggle,
  onChange,
}: {
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div className="relative">
      <LockKeyhole
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        required
        type={
          show
            ? "text"
            : "password"
        }
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`${inputClass} px-10`}
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700"
      >
        {show ? (
          <EyeOff size={17} />
        ) : (
          <Eye size={17} />
        )}
      </button>
    </div>
  );
}

// ======================================================
// FORM FIELD
// ======================================================

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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

// ======================================================
// ERROR
// ======================================================

function ErrorMessage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
      {children}
    </div>
  );
}

// ======================================================
// ROLE
// ======================================================

function RoleBadge({
  role,
}: {
  role: "user" | "admin";
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        role === "admin"
          ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
          : "bg-slate-100 text-slate-600 ring-slate-500/20"
      }`}
    >
      <ShieldCheck size={13} />

      {role === "admin"
        ? "Administrator"
        : "Member"}
    </span>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50";