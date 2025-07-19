"use client";
import React, { useEffect, useState } from "react";

// Helper: get token from localStorage
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : "";

type User = {
  email: string;
};

type FolderStats = {
  [folder: string]: { total: number; unread: number };
};

type Email = {
  uid: string | number;
  subject: string;
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  date: string;
  body?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
    index: number;
  }>;
  read?: boolean;
  flags?: string[];
};


export default function AdminMailDashboard() {
 const [users, setUsers] = useState<User[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [folderStats, setFolderStats] = useState<FolderStats | null>(null);
 const [mails, setMails] = useState<Email[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [loading, setLoading] = useState(false);

  // 1. Fetch all users on mount
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch("https://taskbe.sharda.co.in/api/email/admin/list-email-users", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(console.error);
  }, []);

  // 2. Fetch folder stats when user is selected
  useEffect(() => {
    if (!selectedEmail) return;
    setLoading(true);
    const token = getToken();
    fetch(`https://taskbe.sharda.co.in/api/email/admin/all-folder-stats?targetEmail=${selectedEmail}`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => setFolderStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedEmail]);

  // 3. Fetch mails when folder changes
  useEffect(() => {
    if (!selectedEmail || !selectedFolder) return;
    setLoading(true);
    const token = getToken();
    fetch(`https://taskbe.sharda.co.in/api/email/admin/get-mails?targetEmail=${selectedEmail}&folder=${selectedFolder}`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => setMails(data.emails || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedEmail, selectedFolder]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Email Dashboard</h1>

      {/* --- User Select Dropdown --- */}
      <label className="block mb-2">Select User Email:</label>
      <select
        className="mb-4 px-4 py-2 border rounded"
        value={selectedEmail}
        onChange={e => {
          setSelectedEmail(e.target.value);
          setSelectedFolder("inbox");
        }}
      >
        <option value="">-- Choose a user --</option>
        {users.map(user => (
          <option key={user.email} value={user.email}>{user.email}</option>
        ))}
      </select>

      {/* --- Folder Stats Buttons --- */}
      {folderStats && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            {Object.entries(folderStats).map(([folder, stats]) => (
              <button
                key={folder}
                className={`px-4 py-2 border rounded ${selectedFolder === folder ? "bg-blue-100" : ""}`}
                onClick={() => setSelectedFolder(folder)}
              >
                {folder.charAt(0).toUpperCase() + folder.slice(1)}
                <span className="ml-2 text-xs text-gray-500">
                  ({stats.total} / {stats.unread} unread)
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* --- Mails List --- */}
      {loading && <div>Loading…</div>}
      {mails && mails.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Mails in "{selectedFolder}"</h2>
          <ul className="divide-y">
            {mails.map(mail => (
              <li key={mail.uid} className="py-2">
                <div className="font-bold">{mail.subject}</div>
                <div className="text-sm">{mail.from} → {mail.to}</div>
                <div className="text-xs text-gray-500">{mail.date}</div>
                <div className="text-sm">{mail.text?.slice(0, 100) || "(No body)"}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
