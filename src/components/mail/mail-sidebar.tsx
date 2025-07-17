"use client";
import { useState } from "react";

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Inbox,
  Send,
  FileText,
  Archive,
  Trash2,
  Star,
  Users,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { MailLogo } from "./mail-logo";
import { MailCompose } from "./mail-compose";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MailSidebar({
  onFolderSelect,
  folderCounts,
}: {
  onFolderSelect?: (folder: string) => void;
  folderCounts: {
    inbox: number;
    drafts: number;
    sent: number;
    archived: number;
    trash: number;
    social: number;
    promotions: number;
  };
}) {
  const { open, setOpen, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [selectedFolder, setSelectedFolder] = useState("inbox");

  // Update both local and parent state on click
  const handleFolderClick = (folder: string) => {
    console.log("Clicked:", folder); // Debugging log to check folder value
    setSelectedFolder(folder);

    // Always invoke onFolderSelect to ensure parent component gets updated folder
    if (onFolderSelect) {
      onFolderSelect(folder);
    }
  };

  console.log("folderCounts.inbox : ", folderCounts.inbox);

  return (
    <>
      <SidebarHeader>
        <div className="px-4 py-3 flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className={cn(isCollapsed && "hidden")}></div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8  text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4 " />
              )}
            </Button>
          </div>
          {/* Compose Button */}
          <MailCompose />
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-6 py-4">
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={selectedFolder === "inbox"}
              onClick={() => handleFolderClick("inbox")}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full transition-all ${
                selectedFolder === "inbox"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border-l-4 border-blue-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Inbox className="h-4 w-4" />
              <span>Inbox</span>
              {folderCounts?.inbox > 0 && (
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {folderCounts.inbox}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={selectedFolder === "sent"}
              onClick={() => handleFolderClick("sent")}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full transition-all ${
                selectedFolder === "sent"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border-l-4 border-blue-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Send className="h-4 w-4" />
              <span>Sent</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={selectedFolder === "drafts"}
              onClick={() => handleFolderClick("drafts")}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full transition-all ${
                selectedFolder === "drafts"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border-l-4 border-blue-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Drafts</span>
              {folderCounts?.drafts > 0 && (
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {folderCounts.drafts}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={selectedFolder === "archived"}
              onClick={() => handleFolderClick("archived")}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full transition-all ${
                selectedFolder === "archived"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border-l-4 border-blue-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Archive className="h-4 w-4" />
              <span>Archived</span>
              {folderCounts?.archived > 0 && (
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {folderCounts.archived}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={selectedFolder === "trash"}
              onClick={() => handleFolderClick("trash")}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full transition-all ${
                selectedFolder === "trash"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border-l-4 border-blue-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span>Trash</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Categories
          </SidebarGroupLabel>
          <SidebarMenu className="mt-2 space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={selectedFolder === "social"}
                onClick={() => handleFolderClick("social")}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full transition-all ${
                  selectedFolder === "social"
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border-l-4 border-blue-600"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Social</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  12
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={selectedFolder === "promotions"}
                onClick={() => handleFolderClick("promotions")}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-r-full transition-all ${
                  selectedFolder === "promotions"
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium border-l-4 border-blue-600"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Tag className="h-4 w-4" />
                <span>Promotions</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
