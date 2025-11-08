import { useTradingStore, type Trade } from '@/store/tradingStore';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const formatTradeSize = (trade: Trade) => {
  if (trade.sizingMode === 'LOTS') {
    const lots = trade.lotSize ?? (trade.contractSize ? trade.qty / trade.contractSize : 0);
    return `${lots.toFixed(2)} ${lots === 1 ? 'lot' : 'lots'}`;
  }

  return trade.qty.toLocaleString();
};

export const ClosedTradesTable = () => {
  const trades = useTradingStore((state) => state.trades);
  const closedTrades = trades.filter((t) => t.closedAt).reverse();

  return (
    <div className="rounded-lg border border-border overflow-x-auto">
      <div className="min-w-full">
        <Table className="min-w-[500px] sm:min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Side</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Entry</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">Reason</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {closedTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
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
                      <Badge variant={trade.side === 'LONG' ? 'default' : 'destructive'} className="text-xs">
                        {trade.side}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatTradeSize(trade)}</TableCell>
                    <TableCell className="text-right">${trade.avgPrice.toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-medium ${isPositive ? 'text-long' : 'text-short'}`}>
                      {isPositive ? '+' : ''}${trade.pnl.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {trade.closeReason === 'TAKE_PROFIT' ? '🎯 TP' : 
                         trade.closeReason === 'STOP_LOSS' ? '🛑 SL' : 
                         '✋ Manual'}
                      </Badge>
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
  );
};
