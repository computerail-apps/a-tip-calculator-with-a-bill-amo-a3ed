import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { EmptyState } from '@/lib/ui/EmptyState';
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

function relTime(iso: string): string {
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
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
        <CardDescription>Your last 25 saved splits, most recent first.</CardDescription>
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
              <RefreshCw size={14} />
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
                  <div className="text-body tabular-nums">
                    ${formatMoney(item.bill_amount)}
                    <span className="text-muted-foreground"> bill · {item.tip_percent}% tip · {item.num_people} {item.num_people === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="text-small text-muted-foreground">{relTime(item.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-body tabular-nums text-foreground">${formatMoney(item.per_person_amount)}</div>
                  <div className="text-micro text-muted-foreground">per person</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
