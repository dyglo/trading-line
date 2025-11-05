'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const AnalyticsChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'NASDAQ:AAPL',
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      calendar: false,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      backgroundColor: '#191919',
      gridColor: 'rgba(242, 242, 242, 0.06)',
      withdateranges: true,
      range: 'YTD',
      save_image: true,
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-xl sm:rounded-2xl border border-border bg-card p-0 shadow-sm overflow-hidden h-[280px] xs:h-[320px] sm:h-[420px] md:h-[550px] lg:h-[600px]"
    >
      <div
        ref={containerRef}
        className="tradingview-widget-container h-full w-full [&_iframe]:!touch-none"
        style={{ minHeight: '280px' }}
      />
    </motion.div>
  );
};
