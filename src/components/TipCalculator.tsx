import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/lib/ui/Card';
import { Input } from '@/lib/ui/Input';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { DollarSign, Minus, Plus, Percent, Users, Save, Check } from 'lucide-react';
import { HistoryList, type TipCalculation } from '@/components/HistoryList';
import { ensureUser, supabase, TIP_CALCULATIONS_TABLE } from '@/lib/supabase';

function formatMoney(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function TipCalculator() {
  const [bill, setBill] = useState('64.00');
  const [tipPercent, setTipPercent] = useState(18);
  const [numPeople, setNumPeople] = useState(2);
  const [justSaved, setJustSaved] = useState(false);
  const qc = useQueryClient();

  const {
    data: history,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tip_calculations'],
    queryFn: async () => {
      const user = await ensureUser();
      const { data, error } = await supabase
        .from(TIP_CALCULATIONS_TABLE)
        .select('id,bill_amount,tip_percent,num_people,tip_amount,total_amount,per_person_amount,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(25);
      if (error) throw error;
      return (data ?? []) as TipCalculation[];
    },
  });

  const billNum = useMemo(() => {
    const parsed = parseFloat(bill);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [bill]);

  const tipAmount = billNum * (tipPercent / 100);
  const totalAmount = billNum + tipAmount;
  const perPerson = numPeople > 0 ? totalAmount / numPeople : totalAmount;

  const save = useMutation({
    mutationFn: async () => {
      const user = await ensureUser();
      const { error } = await supabase.from(TIP_CALCULATIONS_TABLE).insert({
        user_id: user.id,
        bill_amount: billNum,
        tip_percent: tipPercent,
        num_people: numPeople,
        tip_amount: tipAmount,
        total_amount: totalAmount,
        per_person_amount: perPerson,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setJustSaved(true);
      qc.invalidateQueries({ queryKey: ['tip_calculations'] });
      setTimeout(() => setJustSaved(false), 1800);
    },
  });

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

          {save.isError && (
            <Alert variant="destructive">
              <AlertTitle>Couldn't save calculation</AlertTitle>
              <AlertDescription>{(save.error as Error).message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={() => save.mutate()} disabled={billNum <= 0 || save.isPending}>
            {justSaved ? <Check size={16} /> : <Save size={16} />}
            {justSaved ? 'Saved' : save.isPending ? 'Saving…' : 'Save calculation'}
          </Button>
        </CardFooter>
      </Card>

      <HistoryList items={history} isLoading={isLoading} error={error as Error | null} onRetry={refetch} />
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
