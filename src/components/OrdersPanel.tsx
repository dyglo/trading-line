import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersTable } from './OrdersTable';
import { TradesTable } from './TradesTable';
import { ClosedTradesTable } from './ClosedTradesTable';
import { OrderModal } from './OrderModal';

export const OrdersPanel = () => {
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-border bg-card p-4 sm:p-5 lg:p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Orders & Trades</h2>
        <Button size="sm" onClick={() => setOrderModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Order
        </Button>
      </div>

      <Tabs defaultValue="trades" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-0">
          <OrdersTable />
        </TabsContent>
        <TabsContent value="trades" className="mt-0">
          <TradesTable />
        </TabsContent>
        <TabsContent value="closed" className="mt-0">
          <ClosedTradesTable />
        </TabsContent>
      </Tabs>

      <OrderModal open={orderModalOpen} onOpenChange={setOrderModalOpen} />
    </motion.div>
  );
};
