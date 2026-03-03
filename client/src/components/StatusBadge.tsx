import { cn } from '@/lib/utils';

type BadgeVariant = 'new' | 'contacted' | 'inspection' | 'closed' | 'qualified' | 'negotiating' | 'won' | 'lost' | 'available' | 'sold' | 'pending' | 'rented' | 'default';

const variants: Record<BadgeVariant, string> = {
  new: 'bg-info/10 text-info border-info/20',
  contacted: 'bg-warning/10 text-warning border-warning/20',
  inspection: 'bg-accent/10 text-accent-foreground border-accent/20',
  closed: 'bg-primary/10 text-primary border-primary/20',
  qualified: 'bg-primary/10 text-primary border-primary/20',
  negotiating: 'bg-accent/10 text-accent-foreground border-accent/20',
  won: 'bg-success/10 text-success border-success/20',
  lost: 'bg-destructive/10 text-destructive border-destructive/20',
  available: 'bg-success/10 text-success border-success/20',
  sold: 'bg-primary/10 text-primary border-primary/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  rented: 'bg-info/10 text-info border-info/20',
  default: 'bg-muted text-muted-foreground border-border',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const variant = (variants[status as BadgeVariant] || variants.default);
  return (
    <span className={cn('badge-status border capitalize', variant, className)}>
      {status}
    </span>
  );
};

export default StatusBadge;
