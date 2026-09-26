import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/lib/ui/Card';
import { Input } from '@/lib/ui/Input';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';
import { DollarSign, Minus, Plus, Percent, Users, Save, Check } from 'lucide-react';
import { HistoryList, type TipCalculation } from '@/components/HistoryList';
import { useAppData } from '@/lib/data';

function formatMoney(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MOCK_HISTORY: TipCalculation[] = [
  {
    id: 'mock-1',
    bill_amount: 84.5,
    tip_percent: 20,
    num_people: 3,
    tip_amount: 16.9,
    total_amount: 101.4,
    per_person_amount: 33.8,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'mock-2',
    bill_amount: 42.0,
    tip_percent: 15,
    num_people: 2,
    tip_amount: 6.3,
    total_amount: 48.3,
    per_person_amount: 24.15,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'mock-3',
    bill_amount: 156.75,
    tip_percent: 18,
    num_people: 4,
    tip_amount: 28.215,
    total_amount: 184.965,
    per_person_amount: 46.24,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'mock-4',
    bill_amount: 19.99,
    tip_percent: 25,
    num_people: 1,
    tip_amount: 5.0,
    total_amount: 24.99,
    per_person_amount: 24.99,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

export function TipCalculator() {
  const [bill, setBill] = useState('64.00');
  const [tipPercent, setTipPercent] = useState(18);
  const [numPeople, setNumPeople] = useState(2);
  const [localAdditions, setLocalAdditions] = useState<TipCalculation[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  const {
    data: history,
    isLoading,
    error,
    refetch,
  } = useAppData<TipCalculation[]>({
    key: 'tip_calculations',
    mock: MOCK_HISTORY,
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });

  const billNum = useMemo(() => {
    const parsed = parseFloat(bill);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [bill]);

  const tipAmount = billNum * (tipPercent / 100);
  const totalAmount = billNum + tipAmount;
  const perPerson = numPeople > 0 ? totalAmount / numPeople : totalAmount;

  const combinedHistory = [...localAdditions, ...(history ?? [])];

  function handleSave() {
    if (billNum <= 0) return;
    const entry: TipCalculation = {
      id: `local-${Date.now()}`,
      bill_amount: billNum,
      tip_percent: tipPercent,
      num_people: numPeople,
      tip_amount: tipAmount,
      total_amount: totalAmount,
      per_person_amount: perPerson,
      created_at: new Date().toISOString(),
    };
    setLocalAdditions((prev) => [entry, ...prev]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-elev-2">
        <CardHeader>
          <CardTitle>Calculate your tip</CardTitle>
          <CardDescription>Adjust the sliders and everything below updates live.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <label className="text-small text-muted-foreground" htmlFor="bill-amount">
              Bill amount
            </label>
            <div className="relative">
              <DollarSign
                size={22}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="bill-amount"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={bill}
                onChange={(e) => setBill(e.target.value)}
                className="h-16 pl-11 text-h1 tabular-nums"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-small text-muted-foreground" htmlFor="tip-slider">
                <Percent size={14} />
                Tip percentage
              </label>
              <Badge variant="outline" className="tabular-nums">
                {tipPercent}%
              </Badge>
            </div>
            <input
              id="tip-slider"
              type="range"
              min={10}
              max={30}
              step={1}
              value={tipPercent}
              onChange={(e) => setTipPercent(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
            <div className="flex justify-between text-micro text-muted-foreground">
              <span>10%</span>
              <span>20%</span>
              <span>30%</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="inline-flex items-center gap-2 text-small text-muted-foreground">
              <Users size={14} />
              Number of people
            </label>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                aria-label="Decrease number of people"
                onClick={() => setNumPeople((n) => Math.max(1, n - 1))}
              >
                <Minus size={16} />
              </Button>
              <span className="w-12 text-center text-h2 tabular-nums">{numPeople}</span>
              <Button
                variant="outline"
                size="sm"
                aria-label="Increase number of people"
                onClick={() => setNumPeople((n) => Math.min(20, n + 1))}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-lg bg-surface p-6 sm:grid-cols-3">
            <Result label="Tip amount" value={tipAmount} />
            <Result label="Total" value={totalAmount} />
            <Result label="Per person" value={perPerson} emphasize />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={handleSave} disabled={billNum <= 0}>
            {justSaved ? <Check size={16} /> : <Save size={16} />}
            {justSaved ? 'Saved' : 'Save calculation'}
          </Button>
        </CardFooter>
      </Card>

      <HistoryList items={combinedHistory} isLoading={isLoading} error={error as Error | null} onRetry={refetch} />
    </div>
  );
}

function Result({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <div className="space-y-1 text-center sm:text-left">
      <div className="text-micro uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={emphasize ? 'text-h1 tabular-nums text-foreground' : 'text-h2 tabular-nums text-foreground'}>
        ${formatMoney(value)}
      </div>
    </div>
  );
}
