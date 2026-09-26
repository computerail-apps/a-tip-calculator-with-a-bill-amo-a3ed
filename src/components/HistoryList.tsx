import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { EmptyState } from '@/lib/ui/EmptyState';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { Button } from '@/lib/ui/Button';
import { History, RefreshCw } from 'lucide-react';

export interface TipCalculation {
  id: string;
  bill_amount: number;
  tip_percent: number;
  num_people: number;
  tip_amount: number;
  total_amount: number;
  per_person_amount: number;
  created_at: string;
}

function formatMoney(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

interface HistoryListProps {
  items: TipCalculation[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function HistoryList({ items, isLoading, error, onRetry }: HistoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent calculations</CardTitle>
        <CardDescription>Your last 25 saved splits.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-12">
            <CenteredSpinner label="Loading history" />
          </div>
        ) : error ? (
          <div className="space-y-3 px-6 pb-6">
            <Alert variant="destructive">
              <AlertTitle>Couldn't load history</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw size={16} />
              Retry
            </Button>
          </div>
        ) : !items || items.length === 0 ? (
          <div className="px-6 pb-6">
            <EmptyState
              icon={<History size={20} />}
              title="No saved calculations yet"
              description="Save a calculation above and it will show up here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-3">
                <div className="flex-1">
                  <div className="text-body tabular-nums text-foreground">
                    ${formatMoney(item.bill_amount)} bill · {item.tip_percent}% tip · {item.num_people}{' '}
                    {item.num_people === 1 ? 'person' : 'people'}
                  </div>
                  <div className="text-micro text-muted-foreground">{formatWhen(item.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-small tabular-nums text-foreground">${formatMoney(item.total_amount)} total</div>
                  <div className="text-micro tabular-nums text-muted-foreground">
                    ${formatMoney(item.per_person_amount)}/person
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
