import { Nav } from '@/lib/ui/Nav';
import { Container } from '@/lib/ui/Container';
import { Receipt } from 'lucide-react';
import { TipCalculator } from '@/components/TipCalculator';

export default function App() {
  return (
    <div className="min-h-screen">
      <Nav
        brand={
          <span className="inline-flex items-center gap-2">
            <Receipt size={20} />
            SplitEasy
          </span>
        }
      />
      <main className="py-8 md:py-12">
        <Container>
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-display">Split the bill, calmly.</h1>
              <p className="text-body text-muted-foreground">
                Enter your bill, drag the tip slider, set the party size — everything updates instantly.
              </p>
            </div>
            <TipCalculator />
          </div>
        </Container>
      </main>
    </div>
  );
}
