import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { EmptyState } from '@/lib/ui/EmptyState';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';
import { History, Users, RefreshCw } from 'lucide-react';

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

interface Props {
  items: TipCalculation[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function HistoryList({ items, isLoading, error, onRetry }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent calculations</CardTitle>
        <CardDescription>Your saved bill splits, most recent first.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-12">
            <CenteredSpinner label="Loading history" />
          </div>
        ) : error ? (
          <div className="px-6 pb-6">
            <Alert variant="destructive">
              <AlertTitle>Couldn't load history</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{error.message}</p>
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RefreshCw size={14} />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : items.length === 0 ? (
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
              <li key={item.id} className="flex flex-wrap items-center gap-3 px-6 py-4 sm:flex-nowrap">
                <Badge variant="outline" className="tabular-nums">
                  {item.tip_percent}%
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="text-body tabular-nums">
                    ${formatMoney(item.bill_amount)} bill &middot; ${formatMoney(item.tip_amount)} tip
                  </div>
                  <div className="inline-flex items-center gap-1 text-small text-muted-foreground">
                    <Users size={12} />
                    {item.num_people} {item.num_people === 1 ? 'person' : 'people'} &middot; {relTime(item.created_at)}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-body font-medium tabular-nums text-foreground">
                    ${formatMoney(item.total_amount)}
                  </div>
                  <div className="text-small tabular-nums text-muted-foreground">
                    ${formatMoney(item.per_person_amount)} / person
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
