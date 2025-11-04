import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export const ProToolkitsSection = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load TradingView widget for the secondary chart
    if (!chartRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'BINANCE:BTCUSD',
      interval: '5',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: false,
      calendar: false,
      hide_side_toolbar: true,
      hide_top_toolbar: true,
      backgroundColor: '#0a0a0a',
      gridColor: 'rgba(255, 255, 255, 0.06)',
      withdateranges: false,
      range: '1D',
      save_image: false,
      support_host: 'https://www.tradingview.com',
    });

    chartRef.current.innerHTML = '';
    chartRef.current.appendChild(script);

    return () => {
      if (chartRef.current) {
        chartRef.current.innerHTML = '';
      }
    };
  }, []);

  const timeframes = ['1m', '5m', '30m', '1h', '1d'];
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m');

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-block border border-primary/50 px-4 py-2 rounded">
              <span className="text-foreground text-sm font-medium">PRO TOOLKITS</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
              The Most Powerful tools, all in one place
            </h2>
            
            <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed">
              Trade automated price action, advanced signals, and spot reversals with money flow. Our world renowned toolkits bring discretionary analysis to the next level...
            </p>
          </motion.div>

          {/* Right Column - Chart Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-lg border border-primary/30 overflow-hidden bg-card/50 backdrop-blur-sm shadow-2xl">
              {/* Chart Header */}
              <div className="bg-card/80 p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-foreground font-semibold">Statistic</h3>
                  <div className="flex items-center gap-2">
                    {timeframes.map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                          selectedTimeframe === tf
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground/60 hover:text-foreground'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="text-foreground text-xs">
                  <span className="font-medium">BTCUSD</span>
                  {' '}
                  <span className="text-foreground/60">O 63243.56</span>
                  {' '}
                  <span className="text-foreground/60">H 67769.00</span>
                  {' '}
                  <span className="text-foreground/60">L 67769.00</span>
                  {' '}
                  <span className="text-foreground/60">L 67769.</span>
                </div>
              </div>

              {/* Chart Container */}
              <div className="relative bg-card" style={{ height: '400px' }}>
                <div
                  ref={chartRef}
                  className="tradingview-widget-container"
                  style={{ height: '100%', width: '100%' }}
                />

                {/* Chart Indicator Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Arrow pointing to green candle */}
                  <div className="absolute bottom-20 right-1/3">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-primary"
                    >
                      <path
                        d="M12 4L20 12H16V20H8V12H4L12 4Z"
                        fill="currentColor"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

