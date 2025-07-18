
export interface AttachmentMeta {
  content: any;
  filename: string;
  contentType: string;
  size: number;
  index: number;
}

export type Mail = {
  [x: string]: ReactNode;
  [x: string]: any;
  [x: string]: boolean;
  [x: string]: boolean;
  [x: string]: ReactNode;
  [x: string]: any;
  to: any;
  uid: Key | null | undefined;
  from: any;
  folder: string;
  starred: unknown;
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  body?: string; // Add this as optional
  date: string;
  read: boolean;
  labels: string[];
  category: "primary" | "promotions" | "social";
  attachments: AttachmentMeta[];
}

export const mails: Mail[] = [
  {
    id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
    name: "William Smith",
    email: "william.smith@example.com",
    subject: "Meeting Tomorrow",
    text: "Hi team, a reminder about our meeting tomorrow at 10 AM to discuss the new project proposal. Please come prepared with your ideas. Looking forward to a productive session. Best, William.",
    date: "2023-10-22T09:00:00",
    read: false,
    labels: ["meeting", "work"],
    category: "primary",
  },
  {
    id: "110e8400-e29b-11d4-a716-446655440000",
    name: "Alice Johnson",
    email: "alice.j@workplace.com",
    subject: "Re: Project Update",
    text: "Thanks for the update! I've reviewed the documents and have a few feedback points. Let's connect briefly today to go over them. Are you free around 3 PM? Regards, Alice.",
    date: "2023-10-22T10:30:00",
    read: false,
    labels: ["work", "important"],
    category: "primary",
  },
  {
    id: "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
    name: "TechWeekly",
    email: "newsletter@techweekly.com",
    subject: "Your Weekly Tech Roundup",
    text: "This week in tech: The future of AI, a deep dive into quantum computing, and our review of the latest gadgets. Don't miss out on the articles that matter. Read now!",
    date: "2023-10-22T12:00:00",
    read: true,
    labels: ["newsletter", "tech"],
    category: "promotions",
  },
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "SocialConnect",
    email: "noreply@socialconnect.com",
    subject: "John Doe commented on your post",
    text: "John Doe and 2 others commented on your post: 'Great insights on the future of renewable energy!' See the full conversation on SocialConnect.",
    date: "2023-10-21T18:45:00",
    read: false,
    labels: ["social"],
    category: "social",
  },
  {
    id: "e9a8b7c6-d5e4-f3a2-1b0c-9d8e7f6a5b4c",
    name: "Emily Davis",
    email: "emily.d@university.edu",
    subject: "Question about your presentation",
    text: "Hi, I was at your talk yesterday and had a follow-up question regarding the data on slide 15. Could you point me to the source? Thanks for the great presentation! Emily.",
    date: "2023-10-20T14:20:00",
    read: true,
    labels: ["networking"],
    category: "primary",
  },
  {
    id: "c8d7e6f5-a4b3-c2d1-e0f9-a8b7c6d5e4f3",
    name: "TravelDeals",
    email: "offers@traveldeals.com",
    subject: "🌴 50% off your next tropical getaway!",
    text: "Escape to paradise with our exclusive offer! For a limited time, get 50% off hotels and flights to top tropical destinations. Your dream vacation is just a click away. Book now!",
    date: "2023-10-20T11:11:00",
    read: false,
    labels: ["travel", "deals"],
    category: "promotions",
  },
  {
    id: "a6b5c4d3-e2f1-a0b9-c8d7-e6f5a4b3c2d1",
    name: "Robert Brown",
    email: "rob.brown@example.com",
    subject: "Your order has shipped!",
    text: "Great news! Your order #12345 from 'Gadget Store' has been shipped and is on its way to you. You can track your package using the link below. Thank you for your purchase!",
    date: "2023-10-19T16:00:00",
    read: true,
    labels: ["shopping"],
    category: "primary",
  },
  {
    id: "b5c4d3e2-f1a0-b9c8-d7e6-f5a4b3c2d1a6",
    name: "Pro Network",
    email: "notifications@pronetwork.com",
    subject: "You have a new connection request",
    text: "Jane Smith, CEO at Innovate Inc., wants to connect with you on Pro Network. Building your professional network helps you discover new opportunities. Accept request.",
    date: "2023-10-18T20:00:00",
    read: true,
    labels: ["social", "networking"],
    category: "social",
  },
];
