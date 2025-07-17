"use client";

import { formatDistanceToNow } from "date-fns";
import * as React from "react";
import type { Mail } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isToday, isYesterday, format } from "date-fns";
import DOMPurify from "dompurify";

interface MailListProps {
  items: Mail[]; // Array of mails passed as props
  onSelectMail: (id: string) => void; // Function to handle mail selection
  currentFolder: string; // Folder from which the mails are fetched
}

export function MailList({
  items,
  onSelectMail,
  currentFolder,
}: MailListProps) {
  if (!items.length) {
    return <div className="p-8 text-center text-muted-foreground">No mail</div>;
  }

  console.log("currentFolder : ", currentFolder);

  function extractDisplayName(fromString: string): string {
    // Try to match the pattern: "Display Name <email@example.com>"
    const nameMatch = fromString.match(/^"?([^"<]+)"?\s*<([^>]+)>$/);

    if (nameMatch && nameMatch[1]) {
      // Return the display name without quotes if present
      return nameMatch[1].trim().replace(/^"+|"+$/g, "");
    }

    // Try to match just the email if no display name
    const emailMatch = fromString.match(/<([^>]+)>/);
    if (emailMatch && emailMatch[1]) {
      return emailMatch[1];
    }

    // Fallback to the entire string if no matches
    return fromString;
  }

  const htmlToText = (html: string, wordLimit = 10) => {
    // Default to 20 words
    if (!html) return "";

    // Remove style/script tags and their content
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [], // Remove all HTML tags
      ALLOWED_ATTR: [], // Remove all attributes
    });

    // Replace multiple spaces/newlines with single space and trim
    const text = clean.replace(/\s+/g, " ").trim();

    // Limit to specified number of words
    const words = text.split(/\s+/);
    const truncated = words.slice(0, wordLimit).join(" ");

    // Add ellipsis if text was truncated
    return words.length > wordLimit ? truncated + "..." : truncated;
  };

  const generateAvatarColor = (str: string) => {
    // Hash calculation
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // HSL color space gives us better control over appearance
    const h = Math.abs(hash) % 360; // Hue (0-360)
    const s = 70 + (Math.abs(hash) % 15); // Saturation (70-85%)
    const l = 60 + (Math.abs(hash) % 15); // Lightness (60-75%)

    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  function darkenHslColor(hsl: string, amount: number = 25) {
    const match = hsl.match(/^hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)$/);
    if (!match) return "#222";
    // TypeScript: string[], so assign then cast
    let h = Number(match[1]);
    let s = Number(match[2]);
    let l = Number(match[3]);
    l = Math.max(0, l - amount);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  const getAvatarProps = (name: string) => {
    const bgColor = generateAvatarColor(name);
    const textColor = darkenHslColor(bgColor, 50); // amount can be tuned
    return {
      style: {
        backgroundColor: bgColor,
        color: textColor,
      },
      children: name.charAt(0).toUpperCase(),
    };
  };

  return (
    // <ScrollArea>
    //   <div className="flex flex-col gap-2 p-4 pt-0">
    //     {items.map((item) => (
    //       <div
    //         key={item.uid}
    //         className={cn(
    //           "flex flex-col gap-3 rounded-lg border p-4 transition-all",
    //           "hover:bg-accent/30 cursor-pointer",
    //           "border-border/50 hover:border-border/70",
    //           !item.read
    //             ? "bg-background border-foreground/15 shadow-xs"
    //             : "bg-muted/10 border-muted/40"
    //         )}
    //         onClick={() => onSelectMail(item.uid)}
    //       >
    //         <div className="flex items-start justify-between gap-3">
    //           <div className="flex items-center gap-3 min-w-0">
    //             {/* Enhanced avatar */}
    //             <div
    //               className={cn(
    //                 "flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center",
    //                 "text-sm font-medium shadow-xs border",
    //                 !item.read
    //                   ? "border-foreground/10 shadow-sm bg-background"
    //                   : "border-muted/30 bg-muted/50"
    //               )}
    //               style={getAvatarProps(extractDisplayName(item.from)).style}
    //             >
    //               {getAvatarProps(extractDisplayName(item.from)).children}
    //             </div>

    //             <div className="min-w-0 space-y-1">
    //               <div className="flex items-center gap-2">
    //                 <p
    //                   className={cn(
    //                     "font-medium truncate",
    //                     !item.read
    //                       ? "text-foreground"
    //                       : "text-muted-foreground/90",
    //                     !item.read && "font-semibold"
    //                   )}
    //                 >
    //                   {extractDisplayName(item.from)}
    //                 </p>
    //                 {!item.read && (
    //                   <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />
    //                 )}
    //               </div>
    //               <p
    //                 className={cn(
    //                   "text-sm truncate",
    //                   !item.read ? "text-foreground" : "text-muted-foreground"
    //                 )}
    //               >
    //                 {item.subject}
    //               </p>
    //             </div>
    //           </div>

    //           <div
    //             className={cn(
    //               "text-xs whitespace-nowrap mt-0.5",
    //               !item.read
    //                 ? "text-foreground/80 font-medium"
    //                 : "text-muted-foreground/70",
    //               "self-start"
    //             )}
    //           >
    //             {formatDistanceToNow(new Date(item.date), {
    //               addSuffix: true,
    //             })}
    //           </div>
    //         </div>

    //         <div
    //           className={cn(
    //             "line-clamp-2 text-sm",
    //             !item.read
    //               ? "text-muted-foreground/90"
    //               : "text-muted-foreground/70",
    //             "leading-snug tracking-wide"
    //           )}
    //         >
    //           {item.text
    //             ? htmlToText(item.text).substring(0, 300)
    //             : item.body
    //             ? htmlToText(item.body).substring(0, 300)
    //             : "(No preview available)"}
    //         </div>

    //         {Array.isArray(item.labels) && item.labels.length > 0 && (
    //           <div className="flex flex-wrap gap-1.5 mt-1">
    //             {item.labels.map((label) => (
    //               <Badge
    //                 key={label}
    //                 variant={!item.read ? "default" : "secondary"}
    //                 className={cn(
    //                   "px-2 py-0.5 text-xs font-normal",
    //                   "transition-colors hover:bg-opacity-80",
    //                   !item.read
    //                     ? "bg-primary/10 text-primary border border-muted/20"
    //                     : "bg-muted/50"
    //                 )}
    //               >
    //                 {label}
    //               </Badge>
    //             ))}
    //           </div>
    //         )}
    //       </div>
    //     ))}
    //   </div>
    // </ScrollArea>

    <ScrollArea className="h-[calc(100vh-64px)] rounded-lg">
      <div className="space-y-2 px-2 py-1">
        {items.map((item) => (
          <div
            key={item.uid}
            onClick={() => onSelectMail(item.uid)}
            className={`
          relative p-4 pr-6 rounded-xl transition-all duration-200
          hover:shadow-sm cursor-pointer border
          group
          ${
            !item.read
              ? "bg-white border-blue-100 hover:border-blue-200 dark:bg-gray-900 dark:border-blue-900/50"
              : "bg-white border-transparent hover:border-gray-200 dark:bg-gray-950 dark:hover:border-gray-800"
          }
        `}
          >
            {/* Unread indicator */}
            {!item.read && currentFolder === "inbox" && (
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-lg" />
            )}

            <div className="flex items-start gap-4">
              {/* Avatar with subtle shadow */}
              <div
                className={`
              flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center 
              shadow-sm transition-transform group-hover:scale-105
              ${
                !item.read
                  ? "ring-2 ring-blue-200 dark:ring-blue-900/80"
                  : "ring-1 ring-gray-100 dark:ring-gray-800"
              }
            `}
                style={getAvatarProps(extractDisplayName(item.from)).style}
              >
                {getAvatarProps(extractDisplayName(item.from)).children}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p
                      className={`
                    text-sm font-medium truncate
                    ${
                      !item.read
                        ? "text-gray-900 font-semibold dark:text-white"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  `}
                    >
                      {extractDisplayName(item.from)}
                    </p>
                  </div>

                  <div
                    className={`
                  text-xs whitespace-nowrap
                  ${
                    !item.read
                      ? "text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-400 dark:text-gray-500"
                  }
                `}
                  >
                    {format(new Date(item.date), "EEE HH:mm")}
                  </div>
                </div>

                <h3
                  className={`
                mt-1 text-sm truncate
                ${
                  !item.read
                    ? "text-gray-900 font-medium dark:text-white"
                    : "text-gray-700 dark:text-gray-300"
                }
              `}
                >
                  {item.subject}
                </h3>

                <p
                  className={`
                mt-1.5 text-sm line-clamp-2
                ${
                  !item.read
                    ? "text-gray-600 dark:text-gray-300"
                    : "text-gray-500 dark:text-gray-500"
                }
              `}
                >
                  {item.text
                    ? htmlToText(item.text).substring(0, 300)
                    : item.body
                    ? htmlToText(item.body).substring(0, 300)
                    : "(No preview available)"}
                </p>

                {Array.isArray(item.labels) && item.labels.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.labels.map((label) => (
                      <Badge
                        key={label}
                        className={`
                      px-2 py-0.5 text-xs font-medium rounded-full
                      transition-colors duration-150
                      ${
                        !item.read
                          ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }
                    `}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
