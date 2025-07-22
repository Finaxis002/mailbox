"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MailDisplay } from "@/components/mail/mail-display";
import { MailSidebar } from "@/components/mail/mail-sidebar";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Mail, mails } from "@/lib/data";

type Folder =
  | "inbox"
  | "drafts"
  | "sent"
  | "archived"
  | "trash"
  | "social"
  | "promotions";
type FolderCounts = Record<Folder, { total: number; unread: number }>;

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [folder, setFolder] = useState("inbox");
  const [mails, setMails] = useState<Mail[]>([]);

  const [loading, setLoading] = useState(false);

  const [folderCounts, setFolderCounts] = useState<FolderCounts>({
    inbox: { total: 0, unread: 0 },
    drafts: { total: 0, unread: 0 },
    sent: { total: 0, unread: 0 },
    archived: { total: 0, unread: 0 },
    trash: { total: 0, unread: 0 },
    social: { total: 0, unread: 0 },
    promotions: { total: 0, unread: 0 },
  });

  const fetchFolderCounts = async (folder: Folder) => {
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");

    // Fetch all mails (increase pageSize if needed for all mails)
    const params = new URLSearchParams({
      email: email || "",
      password: password || "",
      folder,
      page: "1",
      pageSize: "100", // Set to 100 or higher depending on expected max
    });
    const res = await fetch(
      `https://mailbackend.sharda.co.in/api/email/get-mails?${params.toString()}`
    );
    const data = await res.json();

    const emails = data.emails || [];

    // Count unread emails (by 'flags' or 'read')
    const unread = emails.filter(
      (mail: { flags: string | string[]; read: boolean }) =>
        !mail.flags?.includes("\\Seen") && mail.read !== true // covers both
    ).length;

    return {
      total: emails.length,
      unread,
    };
  };

  const fetchAllCounts = async () => {
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");
    const folderList = [
      "inbox",
      "drafts",
      "sent",
      "archived",
      "trash",
      "social",
      "promotions",
    ];

    let newCounts: FolderCounts = {
      inbox: { total: 0, unread: 0 },
      drafts: { total: 0, unread: 0 },
      sent: { total: 0, unread: 0 },
      archived: { total: 0, unread: 0 },
      trash: { total: 0, unread: 0 },
      social: { total: 0, unread: 0 },
      promotions: { total: 0, unread: 0 },
    };
    for (let folder of Object.keys(newCounts) as Folder[]) {
      const counts = await fetchFolderCounts(folder);
      newCounts[folder] = counts;
    }
    setFolderCounts(newCounts);
  };

  useEffect(() => {
    fetchAllCounts();
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "yes";
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      router.push("/login");
    }
  }, [router]);

  const fetchMails = async (selectedFolder: string) => {
    setLoading(true);
    try {
      // For demo only, not safe for prod!
      const email = localStorage.getItem("email");
      const password = localStorage.getItem("password");
      if (!email || !password) throw new Error("Missing credentials");

      const params = new URLSearchParams({
        email,
        password,
        folder: selectedFolder,
        page: "1",
        pageSize: "20",
      });
      const res = await fetch(
        `https://mailbackend.sharda.co.in/api/email/get-mails?${params.toString()}`
      );
      const data = await res.json();

      // Process emails to extract body content
      const processedEmails =
        data.emails?.map((mail: any) => {
          if (!mail.body) return mail;

          // Extract the HTML part between <body> tags
          const bodyMatch = mail.body.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          if (bodyMatch && bodyMatch[1]) {
            return {
              ...mail,
              body: `<body${bodyMatch[0].match(/<body([^>]*)>/i)?.[1] || ""}>${
                bodyMatch[1]
              }</body>`,
            };
          }

          return mail;
        }) || [];

      const sortedEmails = processedEmails.sort((a: Mail, b: Mail) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      console.log("Fetched mails for folder:", selectedFolder, sortedEmails);
      setMails(sortedEmails);
    } catch (err) {
      setMails([]);
      console.error("Failed to fetch mails:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMails(folder);
  }, [folder]);

  if (isLoggedIn === null) return null; // or a loader
  if (!isLoggedIn) return null;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <MailSidebar onFolderSelect={setFolder} folderCounts={folderCounts} />
      </Sidebar>
      <SidebarInset>
        <MailDisplay
          mails={mails}
          setMails={setMails}
          selectedFolder={folder}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
