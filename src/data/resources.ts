export interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  type: "pdf" | "workbook" | "guide" | "toolkit";
  pages: number;
  isPaid: boolean;
  price?: number;
  downloadUrl: string;
  coverColor: string;
}

export const resources: Resource[] = [
  {
    id: "1",
    slug: "anxiety-relief-workbook",
    title: "Anxiety Relief Workbook",
    description: "A 30-day interactive workbook with CBT exercises, journaling prompts, and mindfulness practices to manage anxiety.",
    category: "Anxiety",
    type: "workbook",
    pages: 45,
    isPaid: true,
    price: 19,
    downloadUrl: "#",
    coverColor: "from-emerald-400 to-teal-500"
  },
  {
    id: "2",
    slug: "mindfulness-starter-guide",
    title: "Mindfulness Starter Guide",
    description: "Begin your mindfulness journey with this comprehensive guide featuring meditation techniques and daily practices.",
    category: "Mindfulness",
    type: "guide",
    pages: 28,
    isPaid: false,
    downloadUrl: "#",
    coverColor: "from-violet-400 to-purple-500"
  },
  {
    id: "3",
    slug: "relationship-communication-toolkit",
    title: "Relationship Communication Toolkit",
    description: "Master healthy communication with templates, exercises, and scripts for difficult conversations.",
    category: "Relationships",
    type: "toolkit",
    pages: 52,
    isPaid: true,
    price: 24,
    downloadUrl: "#",
    coverColor: "from-rose-400 to-pink-500"
  },
  {
    id: "4",
    slug: "depression-recovery-handbook",
    title: "Depression Recovery Handbook",
    description: "Evidence-based strategies and daily action plans to support your journey through depression.",
    category: "Depression",
    type: "pdf",
    pages: 38,
    isPaid: true,
    price: 22,
    downloadUrl: "#",
    coverColor: "from-amber-400 to-orange-500"
  },
  {
    id: "5",
    slug: "self-care-checklist",
    title: "Self-Care Checklist Bundle",
    description: "Printable daily, weekly, and monthly self-care checklists to build sustainable habits.",
    category: "Self-Care",
    type: "pdf",
    pages: 15,
    isPaid: false,
    downloadUrl: "#",
    coverColor: "from-cyan-400 to-blue-500"
  },
  {
    id: "6",
    slug: "stress-management-masterclass",
    title: "Stress Management Masterclass",
    description: "Complete guide to understanding stress responses and 50+ techniques for immediate relief.",
    category: "Stress",
    type: "guide",
    pages: 64,
    isPaid: true,
    price: 29,
    downloadUrl: "#",
    coverColor: "from-fuchsia-400 to-purple-600"
  }
];

export const resourceCategories = ["All", "Anxiety", "Mindfulness", "Relationships", "Depression", "Self-Care", "Stress"];
