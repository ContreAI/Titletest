import {
  LayoutDashboard,
  ListChecks,
  FolderOpen,
  DollarSign,
  PenTool,
  Home,
  ClipboardList,
  FileSignature,
  Building2,
} from "lucide-react";
import { TabConfig } from "@/components/layout/TabNavigation";

// Buyer portal: 6 tabs
export const BUYER_TABS: TabConfig[] = [
  {
    id: "dashboard",
    label: "Home",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: <ListChecks className="w-4 h-4" />,
  },
  {
    id: "documents",
    label: "Documents",
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    id: "money",
    label: "Money",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    id: "closing",
    label: "Closing",
    icon: <PenTool className="w-4 h-4" />,
  },
  {
    id: "new_home",
    label: "New Home",
    icon: <Home className="w-4 h-4" />,
  },
];

// Seller portal: 4 tabs (intentionally fewer — sellers want simplicity)
export const SELLER_TABS: TabConfig[] = [
  {
    id: "dashboard",
    label: "Home",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "disclosures",
    label: "Disclosures",
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    id: "money",
    label: "Money",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    id: "closing",
    label: "Closing",
    icon: <PenTool className="w-4 h-4" />,
  },
];

// Default tabs (legacy, used when side is not specified)
export const DEFAULT_TABS: TabConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "contract",
    label: "Contract",
    icon: <FileSignature className="w-4 h-4" />,
  },
  {
    id: "title",
    label: "Title",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: "financial",
    label: "Financial",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    id: "closing",
    label: "Closing",
    icon: <PenTool className="w-4 h-4" />,
  },
];
