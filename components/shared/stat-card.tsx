import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change?: number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
}

export function StatCard({ title, value, change, icon: Icon, iconColor = 'text-primary', iconBg = 'bg-primary/10' }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <p className={cn('mt-1 text-xs font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs last month
              </p>
            )}
          </div>
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', iconBg)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
