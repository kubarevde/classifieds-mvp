import {
  BarChart2,
  Bell,
  Briefcase,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  Globe,
  Heart,
  Home,
  Lock,
  Megaphone,
  MessageCircle,
  Package,
  Plus,
  Search,
  Shield,
  Sprout,
  Star,
  Store,
  TrendingUp,
  Truck,
  Users,
  Video,
  Wrench,
  Zap,
} from "lucide-react";

export const WORLD_ICONS = {
  electronics: Zap,
  autos: Car,
  agriculture: Sprout,
  real_estate: Home,
  realestate: Home,
  services: Wrench,
  jobs: Briefcase,
} as const;

export const STATUS_ICONS = {
  available: CheckCircle2,
  locked: Lock,
  star: Star,
} as const;

export const FEATURE_ICONS = {
  analytics: BarChart2,
  promotion: Megaphone,
  schedule: Calendar,
  video: Video,
  trending: TrendingUp,
  package: Package,
  shield: Shield,
  truck: Truck,
} as const;

export const UI_ICONS = {
  bell: Bell,
  store: Store,
  message: MessageCircle,
  heart: Heart,
  search: Search,
  plus: Plus,
  chevronRight: ChevronRight,
  users: Users,
  globe: Globe,
} as const;
