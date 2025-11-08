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

const getConversionRate = (currency: string | undefined, priceFeed: Record<string, number>) => {
  if (!currency || currency === 'USD') return 1;

  const upper = currency.toUpperCase();
  const direct = `${upper}USD`;
  const inverse = `USD${upper}`;

  if (priceFeed[direct]) return priceFeed[direct];
  if (priceFeed[inverse]) return 1 / priceFeed[inverse];

  return 1;
};

const formatTradeSize = (trade: Trade) => {
  if (trade.sizingMode === 'LOTS') {
    const lots = trade.lotSize ?? (trade.contractSize ? trade.qty / trade.contractSize : 0);
    return `${lots.toFixed(2)} ${lots === 1 ? 'lot' : 'lots'}`;
  }

  return trade.qty.toLocaleString();
};

export const TradesTable = () => {
  const trades = useTradingStore((state) => state.trades);
  const prices = useTradingStore((state) => state.prices);
  const closeTrade = useTradingStore((state) => state.closeTrade);

  const openTrades = trades.filter((t) => !t.closedAt);

  const calculatePnL = (trade: Trade) => {
    if (trade.closedAt) return trade.pnl;

    const currentPrice = prices[trade.symbol] ?? trade.avgPrice;
    const direction = trade.side === 'LONG' ? 1 : -1;

    if (trade.category === 'forex') {
      const pipSize = trade.pipPrecision ?? 0.0001;
      const pipDiff = (currentPrice - trade.avgPrice) / pipSize;
      const contractSize = trade.contractSize ?? 100_000;
      const lotSize = trade.lotSize ?? (trade.contractSize ? trade.qty / trade.contractSize : 0);

      let pipValue = contractSize * pipSize;
      if (trade.baseCurrency === 'USD' && trade.quoteCurrency !== 'USD') {
        pipValue = (contractSize * pipSize) / currentPrice;
      } else if (trade.quoteCurrency && trade.quoteCurrency !== 'USD') {
        pipValue = contractSize * pipSize * getConversionRate(trade.quoteCurrency, prices);
      }

      return pipDiff * pipValue * lotSize * direction;
    }

    const priceDiff = (currentPrice - trade.avgPrice) * direction;
    return priceDiff * trade.qty;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border border-border overflow-x-auto"
    >
      <div className="min-w-full">
        <Table className="min-w-[500px] sm:min-w-[640px]">
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
                    <TableCell className="text-right">{formatTradeSize(trade)}</TableCell>
                    <TableCell className="text-right">${trade.avgPrice.toFixed(2)}</TableCell>
                    <TableCell className={`text-right ${isPositive ? 'text-long' : 'text-short'}`}>
                      {isPositive ? '+' : ''}${pnl.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void closeTrade(trade.id)}
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
