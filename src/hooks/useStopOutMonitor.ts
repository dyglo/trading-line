import { useEffect, useRef } from "react";

import { useAuth } from "@/providers/AuthProvider";
import { useTradingStore } from "@/store/tradingStore";

const RESET_MARGIN = 1.05;

export const useStopOutMonitor = () => {
  const { user, markStopOut } = useAuth();
  const equity = useTradingStore((state) => state.account.equity);
  const hasNotifiedRef = useRef(false);

  useEffect(() => {
    if (!user?.preference) {
      return;
    }

    const threshold = Number(user.preference.stopOutThreshold);
    if (!Number.isFinite(threshold) || threshold <= 0) {
      return;
    }

    if (user.preference.accountStatus === "STOPPED_OUT") {
      hasNotifiedRef.current = false;
      return;
    }

    if (equity <= threshold && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      markStopOut(equity).catch(() => {
        hasNotifiedRef.current = false;
      });
    } else if (equity > threshold * RESET_MARGIN) {
      hasNotifiedRef.current = false;
    }
  }, [equity, markStopOut, user?.preference]);
};
