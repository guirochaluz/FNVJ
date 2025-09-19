import type { ReactNode } from 'react'
import clsx from 'clsx'

interface StatCardProps {
  title: string
  value: string
  helper?: string
  icon?: ReactNode
  accent?: 'brand' | 'emerald' | 'sky' | 'amber'
}

const accentMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  brand: 'from-brand-500/30 to-brand-600/20 border-brand-500/40 text-brand-50',
  emerald: 'from-emerald-500/30 to-emerald-600/20 border-emerald-500/30 text-emerald-50',
  sky: 'from-sky-500/30 to-sky-600/20 border-sky-500/30 text-sky-50',
  amber: 'from-amber-500/30 to-amber-600/20 border-amber-500/30 text-amber-50',
}

export const StatCard = ({ title, value, helper, icon, accent = 'brand' }: StatCardProps) => {
  return (
    <div
      className={clsx(
        'flex flex-col justify-between rounded-3xl border bg-gradient-to-br p-6 shadow-lg shadow-black/30 backdrop-blur',
        accentMap[accent],
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-white/60">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">{value}</h3>
        </div>
        {icon && <div className="text-white/80">{icon}</div>}
      </div>
      {helper && <p className="mt-4 text-xs text-white/70">{helper}</p>}
    </div>
  )
}

export default StatCard
