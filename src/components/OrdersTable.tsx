import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTradingStore, type Order } from '@/store/tradingStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const formatOrderSize = (order: Order) => {
  if (order.sizingMode === 'LOTS') {
    const lots = order.displayQty ?? order.qty / (order.contractSize ?? 100_000);
    return `${lots.toFixed(2)} ${lots === 1 ? 'lot' : 'lots'}`;
  }

  return order.qty.toLocaleString();
};

export const OrdersTable = () => {
  const orders = useTradingStore((state) => state.orders);
  const cancelOrder = useTradingStore((state) => state.cancelOrder);

  const openOrders = orders.filter((o) => o.status === 'OPEN');

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
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {openOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No open orders
                </TableCell>
              </TableRow>
            ) : (
              openOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={order.side === 'LONG' ? 'default' : 'destructive'}>
                      {order.side}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell className="text-right">{formatOrderSize(order)}</TableCell>
                  <TableCell className="text-right">
                    {order.limitPrice?.toFixed(2) || order.stopPrice?.toFixed(2) || 'Market'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelOrder(order.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};
