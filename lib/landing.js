import { Bell, CreditCard, PieChart, Receipt, Users } from "lucide-react";

export const FEATURES = [
  {
    title: "Shared Tabs",
    Icon: Users,
    bg: "bg-orange-100",
    color: "text-orange-600",
    description:
      "Start a tab with friends for shared outings, trips, or household expenses.",
  },
  {
    title: "Auto Balancer",
    Icon: CreditCard,
    bg: "bg-yellow-100",
    color: "text-yellow-600",
    description:
      "Minimize the number of payments needed with automatic debt balancing.",
  },
  {
    title: "Spending Breakdown",
    Icon: PieChart,
    bg: "bg-orange-100",
    color: "text-orange-600",
    description:
      "See where the money’s going with clean visual summaries of group expenses.",
  },
  {
    title: "Due Alerts",
    Icon: Bell,
    bg: "bg-amber-100",
    color: "text-amber-600",
    description:
      "Get notified when someone owes you — or when it’s time to settle up.",
  },
  {
    title: "Custom Split Modes",
    Icon: Receipt,
    bg: "bg-orange-100",
    color: "text-orange-600",
    description:
      "Split bills however you like: equally, by shares, or exact amounts.",
  },
  {
    title: "Instant Sync",
    Icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 14v8M15 14v8M9 2v6M15 2v6" />
      </svg>
    ),
    bg: "bg-yellow-100",
    color: "text-yellow-600",
    description:
      "Changes show up instantly — no need to refresh or guess who added what.",
  },
];

export const STEPS = [
  {
    label: "1",
    title: "Start a Tab",
    description:
      "Create a tab with your friend or group — perfect for trips or shared living.",
  },
  {
    label: "2",
    title: "Log a Bill",
    description:
      "Add an expense, note who paid, and we’ll calculate who owes what.",
  },
  {
    label: "3",
    title: "Settle Fairly",
    description:
      "Track who owes whom, and mark things as paid when you're even.",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "Finally no more arguments over chai bills! This app saved our friendship and my wallet.",
    name: "Babu Rao",
    image: "/testimonials/babubhaiya.png",
    role: "Tea Connoisseur",
  },
  {
    quote:
      "With this tool, I know exactly how much Raju owes me. And I’ve got the receipts!",
    name: "Shyam",
    image: "/testimonials/shyam.png",
    role: "Debt Collector (Amateur)",
  },
  {
    quote:
      "It’s so smooth, I don’t even try to avoid paying anymore. That’s saying something.",
    name: "Raju",
    image: "/testimonials/raju.jpg",
    role: "Master of Excuses",
  },
];
