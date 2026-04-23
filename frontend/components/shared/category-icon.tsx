'use client'

import { cn } from '@/lib/utils'
import {
  Utensils,
  Gamepad2,
  ShoppingBag,
  Bus,
  Heart,
  Home,
  Coffee,
  UtensilsCrossed,
  Cookie,
  CupSoda,
  Wallet,
  Gift,
  TrendingUp,
  Plus,
  Circle,
  CreditCard,
  Phone,
  Wifi,
  Zap,
  Droplets,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  Gamepad2,
  ShoppingBag,
  Bus,
  Heart,
  Home,
  Coffee,
  UtensilsCrossed,
  Cookie,
  CupSoda,
  Wallet,
  Gift,
  TrendingUp,
  Plus,
  Circle,
  CreditCard,
  Phone,
  Wifi,
  Zap,
  Droplets,
}

interface CategoryIconProps {
  icon: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CategoryIcon({
  icon,
  color = '#5B9BD5',
  size = 'md',
  className,
}: CategoryIconProps) {
  const IconComponent = iconMap[icon] || Circle

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: `${color}20` }}
    >
      <IconComponent className={iconSizes[size]} style={{ color }} />
    </div>
  )
}
