import { motion } from 'framer-motion';
import { DollarSign, TrendingUp } from 'lucide-react';
import { useTradingStore } from '@/store/tradingStore';
import { EquityBar } from './EquityBar';

export const AccountPanel = () => {
  const account = useTradingStore((state) => state.account);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2"
    >
      <motion.div
        variants={itemVariants}
        className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-4 md:p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Balance</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">
              ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-4 md:p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Equity</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">
                ${account.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <EquityBar balance={account.balance} equity={account.equity} />
      </motion.div>
    </motion.div>
  );
};
