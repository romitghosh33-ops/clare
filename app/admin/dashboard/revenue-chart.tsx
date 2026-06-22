'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface ChartPoint { date: string; revenue: number; fees: number }

export function RevenueChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fees" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Platform Fees']} labelFormatter={l => `Date: ${l}`} />
        <Area type="monotone" dataKey="revenue" stroke="hsl(221.2, 83.2%, 53.3%)" fill="url(#revenue)" strokeWidth={2} />
        <Area type="monotone" dataKey="fees" stroke="hsl(160, 60%, 45%)" fill="url(#fees)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
