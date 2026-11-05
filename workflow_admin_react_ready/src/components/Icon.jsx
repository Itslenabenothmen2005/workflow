import {
  LayoutDashboard, Globe2, Users, User, BriefcaseBusiness, Folder, ChartNoAxesColumn,
  Star, Bell, Settings, LogOut, Search, Menu, X, Plus, Pencil, Trash2, Power,
  Check, CircleCheck, Clock3, TriangleAlert, Info, Zap, TrendingUp, TrendingDown,
  CalendarDays, FileText, Mail, LockKeyhole, Eye, EyeOff, Filter, Download, Moon, Sun,
  ChevronDown, ChevronLeft, ChevronRight, Building2, MessageSquare, WalletCards,
  ShieldCheck, RefreshCw, Phone, Layers3, Target, List, Grid2X2, Archive, MoreHorizontal
} from "lucide-react";

const icons = {
  dashboard: LayoutDashboard, globe: Globe2, users: Users, user: User,
  briefcase: BriefcaseBusiness, folder: Folder, chart: ChartNoAxesColumn,
  star: Star, bell: Bell, settings: Settings, logout: LogOut, search: Search,
  menu: Menu, x: X, plus: Plus, edit: Pencil, trash: Trash2, power: Power,
  check: Check, "check-circle": CircleCheck, clock: Clock3, alert: TriangleAlert,
  info: Info, zap: Zap, "trend-up": TrendingUp, "trend-down": TrendingDown,
    calendar: CalendarDays, "file-text": FileText, mail: Mail, lock: LockKeyhole, eye: Eye, "eye-off": EyeOff,
  filter: Filter, download: Download, moon: Moon, sun: Sun,
  "chevron-down": ChevronDown, "chevron-left": ChevronLeft, "chevron-right": ChevronRight,
  building: Building2, message: MessageSquare, wallet: WalletCards, shield: ShieldCheck,
  refresh: RefreshCw, phone: Phone, layers: Layers3, target: Target, list: List,
  grid: Grid2X2, archive: Archive, dots: MoreHorizontal
};

export function Icon({name,size=20,className=""}) {
  const C = icons[name] || Info;
  return <C size={size} className={className} strokeWidth={1.7} aria-hidden="true" />;
}
