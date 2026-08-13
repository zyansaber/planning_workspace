import {
  BarChart3,
  Briefcase,
  Calendar,
  ChartPieIcon,
  Clock,
  Cloud,
  FileText,
  FolderKanban,
  Globe,
  Inbox,
  Laptop,
  LayoutGrid,
  Lightbulb,
  Lock,
  Mail,
  Package,
  Palette,
  Rocket,
  Search,
  Smartphone,
  Target,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const iconComponents: Record<string, LucideIcon> = {
  globe: Globe,
  chart: ChartPieIcon,
  briefcase: Briefcase,
  mobile: Smartphone,
  laptop: Laptop,
  palette: Palette,
  chart2: BarChart3,
  zap: Zap,
  wrench: Wrench,
  file: FileText,
  target: Target,
  rocket: Rocket,
  lock: Lock,
  cloud: Cloud,
  bulb: Lightbulb,
  package: Package,
  kanban: FolderKanban,
  users: Users,
  grid: LayoutGrid,
  clock: Clock,
  calendar: Calendar,
  mail: Mail,
  inbox: Inbox,
  search: Search,
};

interface WorkspaceIconProps {
  name?: string;
  className?: string;
}

export function WorkspaceIcon({ name, className = 'w-5 h-5' }: WorkspaceIconProps) {
  const Icon = (name && iconComponents[name]) || Globe;

  return <Icon className={className} aria-hidden="true" />;
}
