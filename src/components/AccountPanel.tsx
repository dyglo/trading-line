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
      className="grid gap-3 sm:gap-4 sm:grid-cols-2"
    >
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight">
              ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Equity</p>
              <p className="text-xl sm:text-2xl font-bold tracking-tight">
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
