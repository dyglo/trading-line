import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { useTradingStore } from '@/store/tradingStore';

export const PortfolioDashboard = () => {
  const { trades, account } = useTradingStore();
  
  const closedTrades = trades.filter((t) => t.closedAt);
  const winningTrades = closedTrades.filter((t) => t.pnl > 0);
  const losingTrades = closedTrades.filter((t) => t.pnl < 0);
  
  const totalPnL = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  const avgWin = winningTrades.length > 0 
    ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length 
    : 0;
  const avgLoss = losingTrades.length > 0 
    ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length 
    : 0;

  const profitFactor = Math.abs(avgLoss) > 0 ? Math.abs(avgWin / avgLoss) : 0;
  
  const metrics = [
    {
      label: 'Total P&L',
      value: `$${totalPnL.toFixed(2)}`,
      icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: totalPnL >= 0 ? 'text-long' : 'text-short',
      bgColor: totalPnL >= 0 ? 'bg-long/10' : 'bg-short/10',
    },
    {
      label: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      icon: Target,
      color: winRate >= 50 ? 'text-long' : 'text-short',
      bgColor: winRate >= 50 ? 'bg-long/10' : 'bg-short/10',
    },
    {
      label: 'Total Trades',
      value: closedTrades.length.toString(),
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Profit Factor',
      value: profitFactor > 0 ? profitFactor.toFixed(2) : 'N/A',
      icon: TrendingUp,
      color: profitFactor >= 1.5 ? 'text-long' : profitFactor >= 1 ? 'text-primary' : 'text-short',
      bgColor: profitFactor >= 1.5 ? 'bg-long/10' : profitFactor >= 1 ? 'bg-primary/10' : 'bg-short/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-border bg-card p-4 sm:p-5 lg:p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold tracking-tight mb-4">Performance Metrics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="relative overflow-hidden rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  <p className={`text-xl sm:text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </p>
                </div>
                <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {closedTrades.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Avg Win: </span>
              <span className="font-medium text-long">+${avgWin.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Loss: </span>
              <span className="font-medium text-short">${avgLoss.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Best Trade: </span>
              <span className="font-medium text-long">
                +${Math.max(...closedTrades.map(t => t.pnl)).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Worst Trade: </span>
              <span className="font-medium text-short">
                ${Math.min(...closedTrades.map(t => t.pnl)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
