const map = {
  active:    { cls: 'badge-active',    dot: 'bg-emerald-500' },
  expired:   { cls: 'badge-expired',   dot: 'bg-red-500' },
  pending:   { cls: 'badge-pending',   dot: 'bg-amber-500' },
  suspended: { cls: 'badge-suspended', dot: 'bg-zinc-400' },
  paid:      { cls: 'badge-paid',      dot: 'bg-emerald-500' },
  failed:    { cls: 'badge-expired',   dot: 'bg-red-500' },
  refunded:  { cls: 'badge-pending',   dot: 'bg-amber-500' },
}

export default function StatusBadge({ status }) {
  const { cls, dot } = map[status] || map.pending
  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} mr-1.5`}></span>
      {status}
    </span>
  )
}
