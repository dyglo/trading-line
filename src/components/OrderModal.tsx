import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTradingStore, Side, OrderType } from '@/store/tradingStore';
import { SymbolSearch } from './SymbolSearch';
import { toast } from 'sonner';

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderModal = ({ open, onOpenChange }: OrderModalProps) => {
  const placeOrder = useTradingStore((state) => state.placeOrder);
  
  const [side, setSide] = useState<Side>('LONG');
  const [symbol, setSymbol] = useState('AAPL');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [qty, setQty] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const qtyNum = parseInt(qty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error('Invalid quantity');
      return;
    }

    placeOrder({
      symbol,
      side,
      type: orderType,
      qty: qtyNum,
      limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
      stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
    });

    toast.success(`${side} order placed for ${qty} ${symbol}`);
    onOpenChange(false);

    // Reset form
    setQty('1');
    setLimitPrice('');
    setStopPrice('');
    setTakeProfit('');
    setStopLoss('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">New Order</DialogTitle>
            <DialogDescription>
              Place a new trading order
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label>Side</Label>
              <ToggleGroup
                type="single"
                value={side}
                onValueChange={(value) => value && setSide(value as Side)}
                className="grid grid-cols-2 gap-2"
              >
                <ToggleGroupItem
                  value="LONG"
                  className="h-12 data-[state=on]:bg-long data-[state=on]:text-long-foreground"
                >
                  LONG
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="SHORT"
                  className="h-12 data-[state=on]:bg-short data-[state=on]:text-short-foreground"
                >
                  SHORT
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <SymbolSearch value={symbol} onValueChange={setSymbol} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderType">Order Type</Label>
                <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
                  <SelectTrigger id="orderType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKET">Market</SelectItem>
                    <SelectItem value="LIMIT">Limit</SelectItem>
                    <SelectItem value="STOP">Stop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>
            </div>

            {orderType === 'LIMIT' && (
              <div className="space-y-2">
                <Label htmlFor="limitPrice">Limit Price</Label>
                <Input
                  id="limitPrice"
                  type="number"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            {orderType === 'STOP' && (
              <div className="space-y-2">
                <Label htmlFor="stopPrice">Stop Price</Label>
                <Input
                  id="stopPrice"
                  type="number"
                  step="0.01"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="takeProfit">Take Profit (Optional)</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  step="0.01"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss (Optional)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.01"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
              >
                Place Order
              </Button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
