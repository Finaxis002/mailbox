"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
  Sparkles,
  Loader2,
  Info,
  TriangleAlert,
} from "lucide-react";

import type { Mail } from "@/lib/data";
import { checkEmailPriority } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { SafeHtmlRenderer } from "./SafeHtmlRenderer";

interface MailViewProps {
  mail: Mail;
  currentFolder: string;
}

const initialState = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" type="submit" disabled={pending} variant="outline">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Check Priority
    </Button>
  );
}

export function MailView({ mail, currentFolder }: MailViewProps) {
  const [state, formAction] = useActionState(checkEmailPriority, initialState);
  const [showReplyModal, setShowReplyModal] = React.useState(false);
  const [replyBody, setReplyBody] = React.useState("");

  const [showForwardModal, setShowForwardModal] = React.useState(false);
  const [forwardBody, setForwardBody] = React.useState("");
  const [forwardTo, setForwardTo] = React.useState("");
  const [forwardSubject, setForwardSubject] = React.useState(""); // Optional, for editing
  const [replySubject, setReplySubject] = React.useState(`Re: ${mail.subject}`);

  const { toast } = useToast();
  let sender = mail.from || "Unknown";
  let displayName = sender;
  let replyTo = "";
  // e.g. `"Sauser <sauser@sharda.co.in>"` or `"\"sauser@sharda.co.in\" <sauser@sharda.co.in>"`
  const match = sender.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    displayName = match[1].replace(/"/g, "");
    replyTo = match[2];
  } else {
    replyTo = sender.replace(/"/g, "");
  }

  let replyToAddress = "";
  if (mail.from) {
    // Extract text within <...>
    const match = mail.from.match(/<([^>]+)>/);
    if (match) {
      replyToAddress = match[1];
    } else {
      // If no <...>, assume full string is the email
      replyToAddress = mail.from;
    }
  }

  const userEmail = localStorage.getItem("email");
  const userPassword = localStorage.getItem("password");

  function normalizeMailboxName(folder: string) {
    if (!folder) return "INBOX";
    const lower = folder.toLowerCase();
    if (lower === "inbox") return "INBOX";
    if (lower === "sent") return "Sent";
    if (lower === "trash" || lower === "deleted") return "Trash";
    if (lower === "archive" || lower === "archived" || lower === "all mail")
      return "Archive";
    if (lower === "drafts" || lower === "draft") return "Drafts";
    // Add more aliases as needed
    return folder; // fallback (maybe custom folders)
  }

  React.useEffect(() => {
    if (state?.result?.isImportant) {
      toast({
        title: "High Priority Email Detected",
        description: state.result.reason,
        variant: "default",
      });
    }
  }, [state, toast]);

  const handleArchive = async () => {
    // Adjust folder name based on conditions
    toast({
      title: "Archive",
      description: `Mail archived (uid: ${mail.uid})`,
    });

    try {
      const normalizedFolder = normalizeMailboxName(currentFolder);
      await fetch(`https://taskbe.sharda.co.in/api/email/${mail.uid}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail, // get from user session/login
          password: userPassword, // get from user session/login
          currentFolder: normalizedFolder, // Use the modified folder
        }),
      });

      // Optionally refresh mail list or remove from UI
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive mail.",
        variant: "destructive",
      });
    }
  };

  const handleTrash = async () => {
    toast({
      title: "Trashed",
      description: `Mail moved to trash (uid: ${mail.uid})`,
    });

    let folderToTrash = currentFolder;

    // Normalize folder name (case-insensitive)
    if (!folderToTrash || folderToTrash.toLowerCase() === "inbox") {
      folderToTrash = "INBOX";
    } else if (
      folderToTrash.toLowerCase() === "archive" ||
      folderToTrash.toLowerCase() === "archived"
    ) {
      folderToTrash = "Archive";
    } else if (folderToTrash.toLowerCase() === "sent") {
      folderToTrash = "Sent";
    } else if (
      folderToTrash.toLowerCase() === "drafts" ||
      folderToTrash.toLowerCase() === "draft"
    ) {
      folderToTrash = "Drafts";
    } else if (
      folderToTrash.toLowerCase() === "trash" ||
      folderToTrash.toLowerCase() === "deleted"
    ) {
      folderToTrash = "Trash";
    }

    try {
      await fetch(`https://taskbe.sharda.co.in/api/email/${mail.uid}/trash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
          currentFolder: folderToTrash,
        }),
      });
      // Optionally refresh UI
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move mail to trash.",
        variant: "destructive",
      });
    }
  };

  const handleForward = () => {
    setForwardSubject(`Fwd: ${mail.subject}`);
    setForwardBody(
      `\n\n---------- Forwarded message ----------\n` +
        `From: ${mail.from}\nDate: ${
          mail.date ? new Date(mail.date).toLocaleString() : ""
        }\nSubject: ${mail.subject}\n\n${mail.text || mail.body || ""}`
    );
    setShowForwardModal(true);
  };

  const handleSendForward = async () => {
    try {
      await fetch("https://taskbe.sharda.co.in/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: userEmail,
          password: userPassword,
          to: forwardTo,
          subject: forwardSubject,
          text: forwardBody,
        }),
      });
      setShowForwardModal(false);
      setForwardTo("");
      setForwardBody("");
      setForwardSubject("");
      toast({
        title: "Forwarded!",
        description: "Mail forwarded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to forward mail.",
        variant: "destructive",
      });
    }
  };

  const handleReply = () => {
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    // Call your backend to send the mail (see below)
    await fetch("https://taskbe.sharda.co.in/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: userEmail, // The user's email address
        password: userPassword, // The user's password
        to: replyToAddress, // The recipient
        subject: `Re: ${mail.subject}`,
        text: replyBody, // The message content
      }),
    });
    setShowReplyModal(false);
    setReplyBody("");
    toast({ title: "Reply sent!" });
  };

  type FolderKey = "INBOX" | "ARCHIVE" | "TRASH" | "DRAFTS" | "SENT";

  const folderActions: Record<FolderKey, string[]> = {
    INBOX: ["archive", "trash"],
    ARCHIVE: ["unarchive", "trash"],
    TRASH: ["restore", "deleteForever"],
    DRAFTS: ["sendDraft", "deleteDraft"],
    SENT: ["archive", "trash"],
  };

  const folderAlias: Record<string, FolderKey> = {
    INBOX: "INBOX",
    SENT: "SENT",
    ARCHIVE: "ARCHIVE",
    ARCHIVED: "ARCHIVE", // <- add this line
    "ALL MAIL": "ARCHIVE", // optional, for Gmail-style
    DRAFTS: "DRAFTS",
    DRAFT: "DRAFTS",
    TRASH: "TRASH",
    DELETED: "TRASH",
  };

  const handleUnarchive = async () => {
    try {
      const normalizedFolder = normalizeMailboxName(currentFolder);
      await fetch(
        `https://taskbe.sharda.co.in/api/email/${mail.uid}/unarchive`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            password: userPassword,
            currentFolder: normalizedFolder, // e.g. "Archived", "Archive", etc.
          }),
        }
      );
      toast({
        title: "Unarchived",
        description: "Mail restored successfully.",
      });
      // Optionally refresh UI or close mail view
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unarchive mail.",
        variant: "destructive",
      });
    }
  };
  const handleRestore = async () => {
    try {
      const normalizedFolder = normalizeMailboxName(currentFolder);
      await fetch(`https://taskbe.sharda.co.in/api/email/${mail.uid}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
          currentFolder: normalizedFolder, // Always send "Trash" not "trash"
        }),
      });
      toast({ title: "Restored", description: "Mail restored from trash." });
      // Optionally refresh UI
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore mail.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteForever = async () => {
    try {
      const normalizedFolder = normalizeMailboxName(currentFolder);
      await fetch(`https://taskbe.sharda.co.in/api/email/${mail.uid}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
          currentFolder: normalizedFolder, // Should be "Trash"
        }),
      });
      toast({ title: "Deleted", description: "Mail permanently deleted." });
      // Optionally refresh UI
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete mail.",
        variant: "destructive",
      });
    }
  };

  const handleSendDraft = async () => {
    try {
      const normalizedFolder = normalizeMailboxName(currentFolder);
      // 1. Send the draft (using your send API)
      await fetch(`https://taskbe.sharda.co.in/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: userEmail,
          password: userPassword,
          to: mail.to,
          subject: mail.subject,
          text: mail.text,
        }),
      });

      // 2. Delete the draft from Drafts
      await fetch(
        `https://taskbe.sharda.co.in/api/email/${mail.uid}/delete-draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            password: userPassword,
            currentFolder: normalizedFolder, // "Drafts"
          }),
        }
      );

      toast({
        title: "Draft Sent",
        description: "Draft sent and removed from Drafts.",
      });
      // Optionally refresh UI
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send draft.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDraft = async () => {
    try {
      const normalizedFolder = normalizeMailboxName(currentFolder);
      await fetch(
        `https://taskbe.sharda.co.in/api/email/${mail.uid}/delete-draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            password: userPassword,
            currentFolder: normalizedFolder, // Should be "Drafts"
          }),
        }
      );
      toast({
        title: "Draft Deleted",
        description: "Draft removed successfully.",
      });
      // Optionally refresh UI
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete draft.",
        variant: "destructive",
      });
    }
  };

  function getActionButtons(folder: string) {
    const upper = (folder || "INBOX").toUpperCase().trim();
    const normalizedFolder: FolderKey = folderAlias[upper] || "INBOX";
    const actions = folderActions[normalizedFolder] || folderActions.INBOX;
    return actions.map((action) => {
      switch (action) {
        case "archive":
          return (
            <Tooltip key="archive">
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleArchive}>
                  <Archive className="h-4 w-4" />
                  <span className="sr-only">Archive</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>
          );
        case "unarchive":
          return (
            <Tooltip key="unarchive">
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleUnarchive}>
                  <ArchiveX className="h-4 w-4" />
                  <span className="sr-only">Unarchive</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Unarchive</TooltipContent>
            </Tooltip>
          );
        case "trash":
          return (
            <Tooltip key="trash">
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleTrash}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Trash</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Trash</TooltipContent>
            </Tooltip>
          );
        case "restore":
          return (
            <Tooltip key="restore">
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleRestore}>
                  <Clock className="h-4 w-4" />
                  <span className="sr-only">Restore</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Restore</TooltipContent>
            </Tooltip>
          );
        case "deleteForever":
          return (
            <Tooltip key="deleteForever">
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteForever}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Delete Forever</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Forever</TooltipContent>
            </Tooltip>
          );
        case "sendDraft":
          return (
            <Tooltip key="sendDraft">
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSendDraft}>
                  <Forward className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send</TooltipContent>
            </Tooltip>
          );
        case "deleteDraft":
          return (
            <Tooltip key="deleteDraft">
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleDeleteDraft}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Draft</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Draft</TooltipContent>
            </Tooltip>
          );
        default:
          return null;
      }
    });
  }

  // Helper functions (define these elsewhere)
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Assuming you have a ReplyIcon component
  function ReplyIcon({ className }: { className?: string }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <polyline points="9 17 4 12 9 7" />
        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
      </svg>
    );
  }

  return (
    <>
      <div className="">
        <SheetHeader className="sr-only">
          <SheetTitle>Email from {mail.name}</SheetTitle>
        </SheetHeader>
        <div className="flex items-center p-4">
          <div className="flex items-center gap-2">
            <TooltipProvider>{getActionButtons(currentFolder)}</TooltipProvider>
            <Separator orientation="vertical" className="mx-1 h-6" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleReply}>
                    <Reply className="h-4 w-4" />
                    <span className="sr-only">Reply</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleForward}>
                    <Forward className="h-4 w-4" />
                    <span className="sr-only">Forward</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forward</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Star thread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Mute thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Separator />
        <div className="flex flex-1 flex-col">
          <div className="group relative flex items-start justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg border border-transparent hover:border-muted/30 shadow-sm hover:shadow-xs">
            <div className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-primary rounded-l-md transition-colors"></div>

            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 mt-0.5">
                <Avatar className="h-10 w-10 border-2 border-background group-hover:border-primary/20 transition-colors">
                  <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-primary/10 to-muted/50">
                    {displayName
                      .split(" ")
                      .map((chunk: any[]) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="grid gap-1.5 flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-semibold text-sm truncate">
                    {displayName}
                  </div>
                  {mail.date && (
                    <div className="hidden md:block flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(mail.date)}
                    </div>
                  )}
                </div>

                <div className="text-sm font-medium line-clamp-1 text-foreground/90">
                  {mail.subject}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 bg-muted/30 px-1.5 py-0.5 rounded-full">
                    <ReplyIcon className="h-3 w-3" />
                    <span className="truncate max-w-[180px]">{replyTo}</span>
                  </span>

                  {mail.date && (
                    <span className="md:hidden text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(mail.date)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />
          <ScrollArea className="flex-1 whitespace-pre-wrap p-4 text-sm">
            {mail.body ? (
              <div className="space-y-4">
                <SafeHtmlRenderer html={mail.body} />
                <div className="text-xs text-muted-foreground mt-4 border-t pt-2">
                  <p>Plain text version:</p>
                  <p className="whitespace-pre-wrap">{mail.text}</p>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{mail.text}</div>
            )}
          </ScrollArea>
          <Separator className="mt-auto" />
          <div className="p-4">
            <form
              action={formAction}
              className="flex flex-col items-start gap-4"
            >
              <input type="hidden" name="emailBody" value={mail.text} />
              <input type="hidden" name="emailSubject" value={mail.subject} />
              <input type="hidden" name="sender" value={mail.name} />
              <SubmitButton />
              {state?.result && (
                <Alert
                  variant={state.result.isImportant ? "destructive" : "default"}
                  className="w-full"
                >
                  <Info className="h-4 w-4" />
                  <AlertTitle>
                    {state.result.isImportant ? "Important!" : "Not Important"}
                  </AlertTitle>
                  <AlertDescription>{state.result.reason}</AlertDescription>
                </Alert>
              )}
              {state?.error && (
                <Alert variant="destructive" className="w-full">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* reply mail Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 z-50">
          {/* Overlay with fade-in animation */}
          <div
            className="fixed inset-0  transition-opacity duration-300"
            onClick={() => setShowReplyModal(false)}
          />

          {/* Modal sliding up from bottom-right */}
          <div className="fixed bottom-4 right-4 w-full max-w-md transform transition-all duration-300 ease-in-out">
            <div className="bg-white rounded-t-lg shadow-2xl overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="flex justify-between items-center bg-gray-50 px-4 py-3 border-b">
                <h2 className="text-lg font-medium text-gray-800">
                  Reply to{" "}
                  <span className="text-blue-600">{replyToAddress}</span>
                </h2>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      Re:
                    </div>
                    <input
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    className="w-full h-40 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write your reply here..."
                    autoFocus
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 border-t flex justify-end gap-2">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReply}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* forward mail model  */}
      {showForwardModal && (
        <div className="fixed inset-0 z-50">
          {/* Overlay with fade-in animation */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowForwardModal(false)}
          />

          {/* Modal with slide-up animation */}
          <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4 transform transition-all duration-300 ease-in-out">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200 sm:rounded-lg">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Forward Message
                </h2>
                <button
                  onClick={() => setShowForwardModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <input
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter email addresses (comma separated)"
                    value={forwardTo}
                    onChange={(e) => setForwardTo(e.target.value)}
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separate multiple addresses with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Subject"
                    value={forwardSubject}
                    onChange={(e) => setForwardSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    className="w-full h-40 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    value={forwardBody}
                    onChange={(e) => setForwardBody(e.target.value)}
                    placeholder="Add any additional message..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowForwardModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendForward}
                  disabled={!forwardTo.trim()}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    !forwardTo.trim()
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Forward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
