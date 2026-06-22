'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface MonthData { month: string; revenue: number; fees: number; orders: number }

export function ReportsCharts({ data }: { data: MonthData[] }) {
  const formatted = data.map(d => ({ ...d, month: d.month.slice(5) + '/' + d.month.slice(0, 4).slice(2) }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number, name: string) => [formatCurrency(v), name === 'revenue' ? 'Revenue' : 'Platform Fees']} />
        <Legend formatter={name => name === 'revenue' ? 'Revenue' : 'Platform Fees'} />
        <Bar dataKey="revenue" fill="hsl(221.2, 83.2%, 53.3%)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="fees" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
