import {
  FileBarChart,
  LayoutDashboard,
  Send,
  Settings,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Customers', href: '/customers', icon: Users },
  { title: 'Outreach', href: '/outreach', icon: Send },
  { title: 'Upload data', href: '/upload', icon: Upload },
  { title: 'Reports', href: '/reports', icon: FileBarChart },
  { title: 'Settings', href: '/settings', icon: Settings },
]

export function getPageTitle(pathname: string) {
  return (
    navItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.title ?? 'Canary'
  )
}
