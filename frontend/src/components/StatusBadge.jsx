const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
};

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

const StatusBadge = ({ status, prefix }) => {
  const normalizedStatus = STATUS_STYLES[status] ? status : 'pending';
  const label = STATUS_LABELS[normalizedStatus];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${STATUS_STYLES[normalizedStatus]}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {prefix ? `${prefix}: ${label}` : label}
    </span>
  );
};

export default StatusBadge;
