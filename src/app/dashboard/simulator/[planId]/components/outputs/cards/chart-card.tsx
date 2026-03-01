import Card from '@/components/ui/card';
import { Subheading } from '@/components/catalyst/heading';

interface ChartCardProps {
  title: string;
  subtitle: string;
  truncateTitle?: boolean;
  className?: string;
  controls?: React.ReactNode;
  children: React.ReactNode;
}

export default function ChartCard({ title, subtitle, truncateTitle, className = 'my-0', controls, children }: ChartCardProps) {
  return (
    <Card className={className}>
      <div className="mb-4 flex items-center justify-between">
        <Subheading level={3} className={truncateTitle ? 'truncate' : undefined}>
          <span className="mr-2">{title}</span>
          <span className="text-muted-foreground hidden sm:inline">{subtitle}</span>
        </Subheading>
        {controls && <div className="flex shrink-0 items-center gap-2">{controls}</div>}
      </div>
      {children}
    </Card>
  );
}
