import { Card, CardContent } from '@/lib/ui/Card';
import { EmptyState } from '@/lib/ui/EmptyState';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';
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

interface Props {
  items: TipCalculation[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}

export function HistoryList({ items, isLoading, error, onRetry }: Props) {
  return (
    <Card>
      <CardContent className="space-y-1 p-0">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-h3">Recent calculations</h2>
          <Button variant="ghost" size="sm" onClick={onRetry} aria-label="Refresh history">
            <RefreshCw size={14} />
          </Button>
        </div>

        {isLoading ? (
          <div className="py-10">
            <CenteredSpinner label="Loading history" />
          </div>
        ) : error ? (
          <div className="px-6 pb-6 pt-2">
            <Alert variant="destructive">
              <AlertTitle>Couldn't load history</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{error.message}</p>
                <Button size="sm" variant="outline" onClick={onRetry}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        ) : !items || items.length === 0 ? (
          <div className="px-6 pb-6 pt-2">
            <EmptyState
              icon={<History size={20} />}
              title="No calculations yet"
              description="Save your first tip calculation above and it will show up here."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-3">
                <Badge variant="outline" className="tabular-nums">
                  {item.tip_percent}%
                </Badge>
                <div className="flex-1">
                  <div className="text-body tabular-nums">${formatMoney(item.bill_amount)} bill</div>
                  <div className="text-micro text-muted-foreground">
                    {item.num_people} {item.num_people === 1 ? 'person' : 'people'} · {relTime(item.created_at)}
                  </div>
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
