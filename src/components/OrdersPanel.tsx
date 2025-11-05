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
      className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm"
    >
      <div className="mb-3 sm:mb-4 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight">Orders & Trades</h2>
        <Button size="sm" className="w-full sm:w-auto touch-manipulation" onClick={() => setOrderModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Order
        </Button>
      </div>

      <Tabs defaultValue="trades" className="w-full">
        <TabsList className="mb-3 sm:mb-4 w-full !flex flex-wrap gap-1.5 sm:gap-2 sm:!inline-flex sm:flex-nowrap h-auto">
          <TabsTrigger value="orders" className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 touch-manipulation">
            Orders
          </TabsTrigger>
          <TabsTrigger value="trades" className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 touch-manipulation">
            Trades
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 touch-manipulation">
            Closed
          </TabsTrigger>
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
