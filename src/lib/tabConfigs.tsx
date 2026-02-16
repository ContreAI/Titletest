import {
  LayoutDashboard,
  ListChecks,
  FolderOpen,
  DollarSign,
  PenTool,
  FileSignature,
  Building2,
} from "lucide-react";
import { TabConfig } from "@/components/layout/TabNavigation";

// Client portal tabs — simplified to 4 tabs for both buyer and seller.
// Agent-level tasks (disclosures management, repair negotiations) moved to agent portal.
// Money info is accessible through Dashboard and Closing tabs.
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
    id: "closing",
    label: "Closing",
    icon: <PenTool className="w-4 h-4" />,
  },
];

export const SELLER_TABS: TabConfig[] = [
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
