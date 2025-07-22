"use client";
import React, { useEffect, useState } from "react";
import { MailDisplayAdmin } from "@/components/admin/MailDisplayAdmin";
import { useRouter } from "next/navigation";
// import Select from "react-select";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import dynamic from "next/dynamic";

import Select, { ActionMeta } from "react-select";

type UserOption = { value: string; label: string };

type User = { email: string; password: string };
type Mail = {
  uid: string | number;
  subject: string;
  from: string;
  to: string;
  date: string;
  body?: string;
  flags?: string[];
  read?: boolean;
  cc?: string;
};

export default function AdminMailDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [folder, setFolder] = useState<"inbox" | "sent">("inbox");
  const [mails, setMails] = useState<Mail[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuPortal, setMenuPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMenuPortal(document.body as HTMLElement);
  }, []);

  // Fetch user list on mount
 useEffect(() => {
  fetch("https://mailbackend.sharda.co.in/api/email/admin/list-email-users ")
    .then((res) => res.json())
    .then((data) => {
      setUsers(data.users || []);
      console.log("Fetched users:", data.users);
    });
}, []);

  // Fetch mails when selectedUser or folder changes
  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(
      `https://mailbackend.sharda.co.in/api/email/admin/get-mails?email=${encodeURIComponent(
        selectedUser.email
      )}&password=${encodeURIComponent(
        selectedUser.password || ""
      )}&folder=${folder.toUpperCase()}&page=1&pageSize=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const list = data.emails || [];
        setMails(
          list.sort(
            (a: Mail, b: Mail) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        );
        setLoading(false);
      });
  }, [selectedUser, folder]);
  const router = useRouter();

  const handleLogOut = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("email");
    localStorage.removeItem("password");

    router.push("/login");
  };

  const userOptions = users.map((user) => ({
    value: user.email,
    label: user.email,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className=" bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b border-blue-100/50 shadow-sm backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Logo/Icon */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                {/* Title */}
                <div className="relative">
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Mailbox Manager
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                      Admin
                    </span>
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    User email management dashboard
                  </p>
                </div>
              </div>

              {/* User Avatar */}

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-lg shadow-inner bg-gradient-to-br from-blue-500 to-indigo-600 text-white cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105">
                    A
                  </div>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="w-48 bg-white rounded-md shadow-lg py-1 z-[9999]"
                    sideOffset={8}
                    align="end"
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <div className="font-medium">Admin User</div>
                      <div className="text-xs text-gray-500">
                        admin@example.com
                      </div>
                    </div>
                    <DropdownMenu.Item
                      onSelect={handleLogOut}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                    >
                      Sign out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="p-6 sm:p-8 z-0">
          {/* Sticky Header Section */}
          <div className="top-0  bg-white/90 backdrop-blur-lg border-b border-blue-100/70 shadow-sm pb-6">
            {/* User Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User Mailbox
              </label>
              <div>
                <Select<UserOption, false>
                  options={userOptions}
                  value={
                    selectedUser
                      ? { value: selectedUser.email, label: selectedUser.email }
                      : null
                  }
                  onChange={(
                    selected: UserOption | null,
                    _action: ActionMeta<UserOption>
                  ) => {
                    if (!selected) {
                      setSelectedUser(null);
                    } else {
                      const user =
                        users.find((u) => u.email === selected.value) || null;
                      setSelectedUser(user);
                    }
                  }}
                  placeholder="Select user..."
                  className="w-full"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#D1D5DB",
                      borderRadius: "0.5rem",
                      padding: "0.25rem",
                      boxShadow: "0 0 0 0",
                      "&:hover": { borderColor: "#60a5fa" }, // blue-400
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 99, // Ensure dropdown overflows modals, etc.
                    }),
                    option: (base, { isFocused, isSelected }) => ({
                      ...base,
                      backgroundColor: isSelected
                        ? "#2563eb" // Tailwind blue-600
                        : isFocused
                        ? "#E0EDFF" // Light blue for focus
                        : "#fff", // Default white
                      color: isSelected
                        ? "#fff" // White text for selected
                        : "#1E293B", // Slate-800 for others
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: isSelected
                          ? "#2563eb" // keep selected the same
                          : "#F1F5F9", // Slight gray/blue on hover (slate-100)
                        color: isSelected ? "#fff" : "#2563eb", // blue text on hover if not selected
                      },
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  menuPortalTarget={menuPortal}
                  instanceId="admin-mail-user-select"
                />
              </div>
            </div>

            {/* Folder Tabs - Only show when user is selected */}
            {selectedUser && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setFolder("inbox")}
                  className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                    folder === "inbox"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Inbox
                </button>
                <button
                  onClick={() => setFolder("sent")}
                  className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
                    folder === "sent"
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Sent
                </button>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="pt-4">
            {selectedUser ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow">
                {loading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="flex items-center space-x-2 animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                    </div>
                  </div>
                ) : (
                  <MailDisplayAdmin
                    mails={mails}
                    currentFolder={folder}
                   selectedUser={selectedUser!}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  ></path>
                </svg>
                <p className="mt-2">Select a user to view their mailbox</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
