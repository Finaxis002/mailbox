"use client";

import * as React from "react";
import Image from "next/image";
import { Search } from "lucide-react";

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
  selectedFolder: string;
}

export function MailDisplay({ mails, selectedFolder }: MailDisplayProps) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { selected, setSelected } = useMail();
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleSelectMail = (mailId: string) => {
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8" size="icon">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/32x32.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
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
