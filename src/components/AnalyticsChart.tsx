'use client';

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface AnalyticsChartProps {
  symbol?: string;
  className?: string;
}

export const AnalyticsChart = ({ symbol = "CRYPTO:BTCUSD", className }: AnalyticsChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "9",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      withdateranges: true,
      studies: ["STD;EMA"],
      backgroundColor: "rgba(5,5,8,0)",
      gridColor: "rgba(255, 255, 255, 0.05)",
      support_host: "https://www.tradingview.com"
    });

    containerRef.current.replaceChildren();
    containerRef.current.appendChild(script);

    return () => {
      containerRef.current?.replaceChildren();
    };
  }, [symbol]);

  return <div ref={containerRef} className={cn("h-full w-full [&_iframe]:rounded-[20px]", className)} />;
};
