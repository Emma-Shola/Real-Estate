import { FileX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="p-4 rounded-2xl bg-muted">
      <FileX className="h-10 w-10 text-muted-foreground" />
    </div>
    <div className="text-center space-y-1">
      <h3 className="font-display font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
    {action}
  </div>
);

export default EmptyState;
