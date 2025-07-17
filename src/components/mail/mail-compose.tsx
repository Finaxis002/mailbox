"use client";
import * as React from "react";
import { PenSquare } from "lucide-react";
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

export function MailCompose() {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { state } = useSidebar();
  const [to, setTo] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const isCollapsed = state === "collapsed";

  const userEmail =
    typeof window !== "undefined" ? localStorage.getItem("email") : "";
  const userPassword =
    typeof window !== "undefined" ? localStorage.getItem("password") : "";

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
      const res = await fetch("https://taskbe.sharda.co.in/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: userEmail,
          password: userPassword,
          to,
          subject,
          text: body,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Email Sent!",
          description: "Your email has been successfully sent.",
        });
        setOpen(false);
        setTo("");
        setSubject("");
        setBody("");
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
        "https://taskbe.sharda.co.in/api/email/save-draft",
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

      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 border-l border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent dark:from-gray-900/5 pointer-events-none" />

        <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <PenSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                New Mail
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-500 dark:text-gray-400">
                Write your email below
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div className="space-y-1">
            <Label
              htmlFor="to"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Recipient
            </Label>
            <Input
              id="to"
              placeholder="recipient@example.com"
              className="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="subject"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Subject
            </Label>
            <Input
              id="subject"
              placeholder="Your subject line"
              className="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-1 flex-1">
            <Label
              htmlFor="body"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Message
            </Label>
            <Textarea
              id="body"
              placeholder="Write your email content here..."
              className="min-h-[300px] border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
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
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-colors"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
