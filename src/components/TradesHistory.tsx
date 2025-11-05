import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useTradingStore } from '@/store/tradingStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const TradesHistory = () => {
  const trades = useTradingStore((state) => state.trades);
  const closedTrades = trades.filter((t) => t.closedAt).slice(-10).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm"
    >
      <h2 className="text-base sm:text-lg font-semibold tracking-tight mb-3 sm:mb-4">Trades History</h2>
      
      <div className="rounded-lg border border-border overflow-x-auto">
        <div className="min-w-full">
          <Table className="min-w-[500px] sm:min-w-[640px] text-xs sm:text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closedTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No closed trades
                  </TableCell>
                </TableRow>
              ) : (
                closedTrades.map((trade) => {
                  const isPositive = trade.pnl >= 0;
                  const date = new Date(trade.closedAt!);

                  return (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={trade.side === 'LONG' ? 'default' : 'destructive'}>
                          {trade.side}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{trade.qty}</TableCell>
                      <TableCell className="text-right">${trade.avgPrice.toFixed(2)}</TableCell>
                      <TableCell className={`text-right ${isPositive ? 'text-long' : 'text-short'}`}>
                        {isPositive ? '+' : ''}${trade.pnl.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {date.toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
};
