import * as React from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  FolderTree,
  HelpCircle,
  Home,
  Laptop,
  Layers,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Menu,
  Moon,
  Package,
  Palette,
  Percent,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Sliders,
  Smartphone,
  Sun,
  Tag,
  Trash2,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
  XCircle,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type IconSize = "sm" | "md" | "lg";

export interface IconProps extends Omit<LucideProps, "size"> {
  size?: IconSize | number;
}

const iconSizeMap: Record<IconSize, string> = {
  sm: "size-4", // 16px
  md: "size-5", // 20px
  lg: "size-6", // 24px
};

export function createIcon(IconComponent: LucideIcon) {
  const WrappedIcon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ className, size = "md", strokeWidth = 1.75, ...props }, ref) => {
      const sizeClass = typeof size === "string" ? iconSizeMap[size] : undefined;
      const explicitSize = typeof size === "number" ? size : undefined;

      return (
        <IconComponent
          ref={ref}
          strokeWidth={strokeWidth}
          size={explicitSize}
          className={cn("shrink-0 text-current", sizeClass, className)}
          aria-hidden="true"
          {...props}
        />
      );
    }
  );
  WrappedIcon.displayName = `Icon(${IconComponent.displayName || IconComponent.name || "Component"})`;
  return WrappedIcon;
}

export const Icons = {
  // Navigation & Actions
  ArrowLeft: createIcon(ArrowLeft),
  ArrowRight: createIcon(ArrowRight),
  ArrowUp: createIcon(ArrowUp),
  ArrowDown: createIcon(ArrowDown),
  ChevronLeft: createIcon(ChevronLeft),
  ChevronRight: createIcon(ChevronRight),
  ChevronUp: createIcon(ChevronUp),
  ChevronDown: createIcon(ChevronDown),
  Plus: createIcon(Plus),
  X: createIcon(X),
  Copy: createIcon(Copy),
  Search: createIcon(Search),
  Refresh: createIcon(RefreshCw),
  Trash: createIcon(Trash2),
  Eye: createIcon(Eye),
  EyeOff: createIcon(EyeOff),
  Logout: createIcon(LogOut),
  Menu: createIcon(Menu),

  // Status & Feedback
  Check: createIcon(Check),
  CheckCircle: createIcon(CheckCircle2),
  AlertCircle: createIcon(AlertCircle),
  AlertTriangle: createIcon(AlertTriangle),
  XCircle: createIcon(XCircle),
  HelpCircle: createIcon(HelpCircle),
  Spinner: createIcon(Loader2),
  Clock: createIcon(Clock),

  // Domain & Entity
  LayoutDashboard: createIcon(LayoutDashboard),
  Home: createIcon(Home),
  Users: createIcon(Users),
  User: createIcon(User),
  Shield: createIcon(Shield),
  ShieldCheck: createIcon(ShieldCheck),
  Settings: createIcon(Settings),
  Dollar: createIcon(DollarSign),
  TrendingUp: createIcon(TrendingUp),
  Percent: createIcon(Percent),
  FileText: createIcon(FileText),
  Layers: createIcon(Layers),
  Lock: createIcon(Lock),
  CreditCard: createIcon(CreditCard),
  Wallet: createIcon(Wallet),
  ShoppingCart: createIcon(ShoppingCart),
  Package: createIcon(Package),
  FolderTree: createIcon(FolderTree),
  Tag: createIcon(Tag),
  Send: createIcon(Send),
  Radio: createIcon(Radio),
  Activity: createIcon(Activity),
  Server: createIcon(Server),
  Sliders: createIcon(Sliders),
  Palette: createIcon(Palette),

  // Theme & Devices
  Sun: createIcon(Sun),
  Moon: createIcon(Moon),
  Laptop: createIcon(Laptop),
  Smartphone: createIcon(Smartphone),
};
