import { Progress } from '@/components/ui/progress';

interface EquityBarProps {
  balance: number;
  equity: number;
}

export const EquityBar = ({ balance, equity }: EquityBarProps) => {
  const pnl = equity - balance;
  const pnlPercent = balance > 0 ? (pnl / balance) * 100 : 0;
  const isPositive = pnl >= 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">P&L</span>
        <span className={isPositive ? 'text-long' : 'text-short'}>
          {isPositive ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent > 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
        </span>
      </div>
      <Progress
        value={Math.min(100, Math.max(0, 50 + pnlPercent))}
        className="h-2"
      />
    </div>
  );
};
