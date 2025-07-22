"use client";
import * as React from "react";
import { FileText, Loader2, Paperclip, PenSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { motion } from "framer-motion";

type Attachment = { filename: string; content: string; encoding: string };

export function MailCompose() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { state } = useSidebar();
  const [to, setTo] = React.useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const isCollapsed = state === "collapsed";

  const userEmail =
    typeof window !== "undefined" ? localStorage.getItem("email") : "";
  const userPassword =
    typeof window !== "undefined" ? localStorage.getItem("password") : "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];

    Promise.all(
      files.map((file) => {
        return new Promise<{
          filename: string;
          content: string;
          encoding: string;
        }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            resolve({
              filename: file.name,
              content: (ev.target?.result as string).split(",")[1], // remove data:*/*;base64,
              encoding: "base64",
            });
          };
          reader.readAsDataURL(file);
        });
      })
    ).then(setAttachments);
  };

  const handleSend = async () => {
    if (!to || !subject || !body) {
      toast({
        title: "Missing Fields",
        description: "Please fill all fields before sending.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://mailbackend.sharda.co.in/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: userEmail,
          password: userPassword,
          to,
          cc,
          bcc,
          subject,
          text: body,
          attachments, // <-- array of {filename, content, encoding}
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Email Sent!",
          description: "Your email has been successfully sent.",
        });
        setTo("");
        setCc("");
        setBcc("");
        setSubject("");
        setBody("");
        setAttachments([]);
      } else {
        toast({
          title: "Failed to Send",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save Draft Logic
  const handleSaveDraft = async () => {
    if (!to || !subject || !body) {
      toast({
        title: "Missing Fields",
        description: "Please fill all fields before saving as draft.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        "https://mailbackend.sharda.co.in/api/email/save-draft",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail, // instead of "from"
            password: userPassword,
            to,
            subject,
            text: body,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Draft Saved!",
          description: "Your draft has been successfully saved.",
        });
        setOpen(false);
        setTo("");
        setSubject("");
        setBody("");
      } else {
        toast({
          title: "Failed to Save Draft",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                variant="default"
                className={cn(
                  "w-full p-2 transition-all duration-300 hover:shadow-md",
                  isCollapsed && "h-9 w-9 shrink-0 p-0 ml-[-3vh]"
                )}
              >
                <PenSquare className={cn(!isCollapsed && "mr-2", "h-4 w-4")} />
                <span className={cn(isCollapsed && "sr-only")}>Compose</span>
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" hidden={!isCollapsed}>
            <span className="font-medium">Compose New Email</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

     

      <SheetContent className="w-full sm:max-w-2xl h-full flex flex-col p-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent dark:from-gray-900/10 pointer-events-none" />

        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <PenSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Compose New Email
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500 dark:text-gray-400">
                Write your message below
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Email form */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
          {/* Recipient row */}
          <div className="space-y-4">
            {/* To Field */}
            <div className="group relative">
              <div className="flex items-start">
                <Label
                  htmlFor="to"
                  className="w-20 pt-3 text-sm font-medium text-gray-500 dark:text-gray-400 transition-all group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
                >
                  To:
                </Label>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Input
                      id="to"
                      placeholder="recipient@example.com"
                      className="flex-1 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-3 px-4 rounded-lg bg-white dark:bg-gray-900 shadow-sm"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-1">
                      {!showCc && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          onClick={() => setShowCc(true)}
                        >
                          <span className="hidden sm:inline">Cc</span>
                          <span className="sm:hidden">+Cc</span>
                        </Button>
                      )}
                      {!showBcc && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          onClick={() => setShowBcc(true)}
                        >
                          <span className="hidden sm:inline">Bcc</span>
                          <span className="sm:hidden">+Bcc</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Email chips could be added here for multiple recipients */}
                </div>
              </div>
            </div>

            {/* Cc Field - Animated */}
            {showCc && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden"
              >
                <div className="flex items-start">
                  <Label
                    htmlFor="cc"
                    className="w-20 pt-3 text-sm font-medium text-gray-500 dark:text-gray-400 transition-all group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
                  >
                    Cc:
                  </Label>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      id="cc"
                      placeholder="cc@example.com"
                      className="flex-1 border-gray-300 dark:border-gray-700 py-3 px-4 rounded-lg bg-white dark:bg-gray-900 shadow-sm"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                      onClick={() => setShowCc(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bcc Field - Animated */}
            {showBcc && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden"
              >
                <div className="flex items-start">
                  <Label
                    htmlFor="bcc"
                    className="w-20 pt-3 text-sm font-medium text-gray-500 dark:text-gray-400 transition-all group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400"
                  >
                    Bcc:
                  </Label>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      id="bcc"
                      placeholder="bcc@example.com"
                      className="flex-1 border-gray-300 dark:border-gray-700 py-3 px-4 rounded-lg bg-white dark:bg-gray-900 shadow-sm"
                      value={bcc}
                      onChange={(e) => setBcc(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                      onClick={() => setShowBcc(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          {/* Subject */}
          <div className="space-y-1">
            <Label
              htmlFor="subject"
              className="text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              Subject
            </Label>
            <Input
              id="subject"
              placeholder="What's this email about?"
              className="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Attachments
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              {/* Add Files Button */}
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900 border-blue-100 dark:border-blue-800"
                  asChild
                >
                  <div>
                    <Paperclip className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">Add files</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </Button>
              </label>

              {/* File Chips */}
              {attachments.length > 0 &&
                attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center max-w-xs px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-full shadow-sm mr-2 mb-2 animate-in fade-in"
                  >
                    <FileText className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-300" />
                    <span className="truncate max-w-[120px] text-sm font-medium">
                      { file.filename}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newAttachments = [...attachments];
                        newAttachments.splice(index, 1);
                        setAttachments(newAttachments);
                      }}
                      className="ml-2 text-blue-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-full focus:outline-none"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Message body */}
          <div className="space-y-1 flex-1">
            <Label
              htmlFor="body"
              className="text-sm font-medium text-gray-600 dark:text-gray-300"
            >
              Message
            </Label>
            <Textarea
              id="body"
              placeholder="Write your message here..."
              className="min-h-[150px] border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        {/* Footer with actions */}
        <div className="border-t mb-[10%] border-gray-100 dark:border-gray-800 px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Discard
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={loading}
                className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Save Draft
              </Button>
              <Button
                onClick={handleSend}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
