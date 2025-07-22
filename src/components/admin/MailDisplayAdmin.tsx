"use client";

import * as React from "react";
import { useState } from "react";
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
  X,
} from "lucide-react";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaFileImage,
  FaDownload,
} from "react-icons/fa";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { SafeHtmlRenderer } from "../mail/SafeHtmlRenderer";

type Mail = {
  uid: string | number;
  from: string;
  to: string;
  subject: string;
  date: string;
  body?: string;
  cc?: string;
  text?: string;
  attachments?: {
    filename: string;
    contentType: string;
    size: number;
    content: string;
    index: number;
  }[];
};

type MailDisplayAdminProps = {
  mails: Mail[];
  currentFolder: string;
};

export function MailDisplayAdmin({ mails }: MailDisplayAdminProps) {
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();

  if (!mails.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-700">No messages found</h3>
        <p className="text-gray-500 mt-1">This mailbox is currently empty</p>
      </div>
    );
  }

  const handleViewDetails = (mail: Mail) => {
    setSelectedMail(mail);
    setIsSheetOpen(true);
  };

  const getFileIcon = (mimeType: string, fileName: string) => {
    if (
      mimeType?.startsWith("image") ||
      /\.(jpg|jpeg|png|gif)$/i.test(fileName)
    )
      return <FaFileImage className="text-blue-400" />;
    if (/pdf$/.test(mimeType) || /\.pdf$/i.test(fileName))
      return <FaFilePdf className="text-red-500" />;
    if (/word|msword/.test(mimeType) || /\.(doc|docx)$/i.test(fileName))
      return <FaFileWord className="text-blue-700" />;
    if (/excel|spreadsheet/.test(mimeType) || /\.(xls|xlsx)$/i.test(fileName))
      return <FaFileExcel className="text-green-700" />;
    return <FaFileAlt className="text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
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
  };

  const extractDisplayName = (email: string) => {
    const match = email.match(/^(.*?)\s*<(.+?)>$/);
    if (match) {
      return match[1].replace(/"/g, "");
    }
    return email;
  };

  function getFirstNWordsFromHtml(html: string | undefined, wordCount = 15) {
    if (!html) return "";

    // 1. Remove <style>...</style> blocks completely
    html = html.replace(/<style[\s\S]*?<\/style>/gi, "");

    // 2. Create a temporary element to strip HTML tags
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";

    // 3. Split into words and rejoin first N
    const words = text.trim().split(/\s+/);
    return words.length > wordCount
      ? words.slice(0, wordCount).join(" ") + "..."
      : text;
  }

  const generateAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    const s = 70 + (Math.abs(hash) % 15);
    const l = 60 + (Math.abs(hash) % 15);
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  function darkenHslColor(hsl: string, amount: number = 25) {
    const match = hsl.match(/^hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)$/);
    if (!match) return "#222";
    let h = Number(match[1]);
    let s = Number(match[2]);
    let l = Number(match[3]);
    l = Math.max(0, l - amount);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  const getAvatarProps = React.useMemo(
    () => (name: string) => {
      const bgColor = generateAvatarColor(name);
      const textColor = darkenHslColor(bgColor, 50);
      return {
        style: {
          backgroundColor: bgColor,
          color: textColor,
        },
        children: name.charAt(0).toUpperCase(),
      };
    },
    []
  );

  return (
    <>
      <div className="space-y-3">
        {mails.map((mail) => (
          <div
            key={mail.uid}
            onClick={() => handleViewDetails(mail)}
            className="group relative p-4 hover:bg-gray-50/80 transition-all duration-200 border border-gray-100 rounded-xl hover:shadow-sm cursor-pointer"
          >
            {/* Highlight bar on hover */}
            <div className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-blue-500 rounded-l-lg transition-colors duration-300"></div>

            <div className="flex items-start gap-4">
              {/* Avatar with subtle shadow */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-medium shadow-sm"
                style={getAvatarProps(extractDisplayName(mail.from)).style}
              >
                {getAvatarProps(extractDisplayName(mail.from)).children}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {extractDisplayName(mail.from)}
                    </h3>
                    {mail.cc && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        CC
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(mail.date)}
                  </span>
                </div>

                {/* Recipient */}
                <p className="text-xs text-gray-500 truncate">
                  <span className="text-gray-400">to:</span> {mail.to}
                </p>

                {/* Subject */}
                <h2 className="text-base font-medium text-gray-900 line-clamp-1">
                  {mail.subject}
                </h2>

                {/* Body preview */}
                <div className="text-sm text-gray-600 line-clamp-2">
                  {mail.body ? (
                    <span>{getFirstNWordsFromHtml(mail.body, 15)}</span>
                  ) : mail.text ? (
                    <span>{getFirstNWordsFromHtml(mail.text, 15)}</span>
                  ) : null}
                </div>

                {/* Hover actions */}
                <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(mail);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    Quick view
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right-side Sheet for email details */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl p-0 overflow-hidden">
          {/* Header with close button */}
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
            <SheetHeader className="flex flex-row items-center justify-between">
              <SheetTitle>Email Details</SheetTitle>
            </SheetHeader>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSheetOpen(false)}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedMail && (
            <div className="p-6">
              {/* Email header */}
              <div className="flex items-start gap-4 pb-4">
                <Avatar className="h-12 w-12 border border-gray-200 shadow-sm">
                  <AvatarFallback
                    className="text-lg font-medium"
                    style={
                      getAvatarProps(extractDisplayName(selectedMail.from))
                        .style
                    }
                  >
                    {
                      getAvatarProps(extractDisplayName(selectedMail.from))
                        .children
                    }
                  </AvatarFallback>
                </Avatar>

                <div className="grid gap-1.5 flex-1 min-w-0">
                  {/* From and Date Row */}
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="font-semibold text-sm truncate">
                      {extractDisplayName(selectedMail.from)}
                    </div>
                    {selectedMail.date && (
                      <div className="hidden md:block flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(selectedMail.date)}
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="text-sm font-medium line-clamp-1 text-foreground/90">
                    {selectedMail.subject}
                  </div>

                  {/* Recipient Info */}
                  {selectedMail.to && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">To:</span>{" "}
                      {selectedMail.to}
                    </div>
                  )}
                  {selectedMail.cc && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">Cc:</span>{" "}
                      {selectedMail.cc}
                    </div>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="py-4 border-y border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedMail.subject}
                </h2>
              </div>

              {/* Attachments */}
              {selectedMail.attachments &&
                selectedMail.attachments.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Attachments
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedMail.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {att.contentType.startsWith("image") ? (
                              <img
                                src={`data:${att.contentType};base64,${att.content}`}
                                alt={att.filename}
                                className="h-10 w-10 rounded border object-cover bg-white"
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center">
                                {getFileIcon(att.contentType, att.filename)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {att.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(att.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Download"
                          >
                            <FaDownload className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Email body */}
              <div className="mt-6">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  {selectedMail.body ? (
                    <div className="prose prose-sm max-w-none">
                      <SafeHtmlRenderer html={selectedMail.body} />
                      {selectedMail.text && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Plain text version
                          </h4>
                          {/* <div className="text-sm text-gray-600 whitespace-pre-wrap">
                            {selectedMail.text}
                          </div> */}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">
                      {selectedMail.text}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
