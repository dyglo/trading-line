import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTradingStore, type Trade } from '@/store/tradingStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const TradesTable = () => {
  const trades = useTradingStore((state) => state.trades);
  const prices = useTradingStore((state) => state.prices);
  const closeTrade = useTradingStore((state) => state.closeTrade);

  const openTrades = trades.filter((t) => !t.closedAt);

  const calculatePnL = (trade: Trade) => {
    if (trade.closedAt) return trade.pnl;
    
    const currentPrice = prices[trade.symbol] || trade.avgPrice;
    const priceDiff = trade.side === 'LONG'
      ? currentPrice - trade.avgPrice
      : trade.avgPrice - currentPrice;
    return priceDiff * trade.qty;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-border overflow-x-auto -mx-4 sm:-mx-5 lg:-mx-6"
    >
      <div className="inline-block min-w-full px-4 sm:px-5 lg:px-6">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Avg Price</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {openTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No open trades
                </TableCell>
              </TableRow>
            ) : (
              openTrades.map((trade) => {
                const pnl = calculatePnL(trade);
                const isPositive = pnl >= 0;

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
                      {isPositive ? '+' : ''}${pnl.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => closeTrade(trade.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};
