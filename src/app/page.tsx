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

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [folder, setFolder] = useState("inbox");
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(false);

  const [folderCounts, setFolderCounts] = useState({
    inbox: 0,
    drafts: 0,
    sent: 0,
    archived: 0,
    trash: 0,
    social: 0,
    promotions: 0,
  });

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
    let newCounts: {
      inbox: number;
      drafts: number;
      sent: number;
      archived: number;
      trash: number;
      social: number;
      promotions: number;
    } = {
      inbox: 0,
      drafts: 0,
      sent: 0,
      archived: 0,
      trash: 0,
      social: 0,
      promotions: 0,
    };

    for (let folder of folderList) {
      const params = new URLSearchParams({
        email: email || "",
        password: password || "",
        folder,
        page: "1",
        pageSize: "1",
      });
      const res = await fetch(
        `https://taskbe.sharda.co.in/api/email/get-mails?${params.toString()}`
      );
      const data = await res.json();
      // TypeScript knows all keys exist now
      newCounts[folder as keyof typeof newCounts] =
        data.total || data.emails?.length || 0;
    }

    setFolderCounts(newCounts); // ✅ No TS error now!
  };

  // Call fetchAllCounts after login, after every mail action, or on an interval
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
        `https://taskbe.sharda.co.in/api/email/get-mails?${params.toString()}`
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
        <MailDisplay mails={mails} selectedFolder={folder} />
      </SidebarInset>
    </SidebarProvider>
  );
}
