"use client";

import * as React from "react";
import Image from "next/image";
import { Cross, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Mail } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { useMail } from "@/hooks/use-mail";
import { MailList } from "./mail-list";
import { MailView } from "./mail-view";

interface MailDisplayProps {
  mails: Mail[];
  setMails: React.Dispatch<React.SetStateAction<Mail[]>>;
  selectedFolder: string;
}

export function MailDisplay({
  mails,
  setMails,
  selectedFolder,
}: MailDisplayProps) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { selected, setSelected } = useMail();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [userLetter, setUserLetter] = React.useState("U");
  const router = useRouter();
  const userRole =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;

  async function markMailAsRead(uid: string, email: string, password: string) {
    const res = await fetch(
      `https://taskbe.sharda.co.in/api/email/${uid}/mark-as-read`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    return res.json();
  }

  const handleSelectMail = async (mailId: string) => {
    const mail = mails.find((m) => m.uid === mailId);

    // Mark as read only if unread
    if (mail && !mail.read) {
      const email = localStorage.getItem("email");
      const password = localStorage.getItem("password");

      if (!email || !password) {
        // handle missing credentials (logout, show error, etc)
        console.error("Missing email or password in localStorage");
        return;
      }
      try {
        const result = await markMailAsRead(mailId, email, password);
        console.log("Mark as read result:", result);

        // Update local mails state to reflect the mail as read
        setMails((prevMails) =>
          prevMails.map((m) => (m.uid === mailId ? { ...m, read: true } : m))
        );
      } catch (err) {
        console.error("Mark as read error:", err);
      }
    }

    setSelected(mailId);
    setIsSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setSelected(null);
    }
  };

  // Search filtering (this is OK to keep)
  const filteredMails = mails.filter(
    (mail) =>
      mail.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.date?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // The selected mail by uid (not id)
  const selectedMail = mails.find((item) => item.uid === selected);

  console.log("selectedFolder : ", selectedFolder);

  const handleLogOut = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("email");
    localStorage.removeItem("password");

    router.push("/login");
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("email");
      if (email) {
        setUserLetter(email.charAt(0).toUpperCase());
      }
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex-1">
          <div className="relative pr-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              className="pl-10 pr-4 py-5 rounded-xl border-border/50 hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 focus:outline-none"
                aria-label="Clear search"
              >
                <Cross className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 rounded-full"
              size="icon"
            >
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {userLetter || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogOut}>Logout</DropdownMenuItem>
           {userRole === 'admin' && (
             <DropdownMenuItem onClick={() => router.push("/admin")}>
              Mailbox Users Management
            </DropdownMenuItem>
           )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />

      <div className="flex-1 overflow-y-auto">
        <MailList
          items={filteredMails}
          onSelectMail={handleSelectMail}
          currentFolder={selectedFolder}
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="w-full sm:w-[650px] sm:max-w-none p-4 flex flex-col">
          <SheetTitle>Email Details</SheetTitle>
          {selectedMail ? (
            <MailView mail={selectedMail} currentFolder={selectedFolder} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Select an email to view</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
