import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const chartTabs = [
  {
    id: 1,
    title: 'Gold Trading',
    symbol: 'TVC:GOLD',
    label: 'CFDS on Gold (US$/Oz) . TVC',
  },
  {
    id: 2,
    title: 'Bitcoin',
    symbol: 'BINANCE:BTCUSD',
    label: 'BTCUSD',
  },
  {
    id: 3,
    title: 'Forex',
    symbol: 'FX_IDC:EURUSD',
    label: 'EUR/USD',
  },
];

export const HeroSection = () => {
  const chartRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load TradingView widgets for each chart
    chartTabs.forEach((tab, index) => {
      const chartRef = chartRefs.current[tab.id];
      if (!chartRef) return;

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: tab.symbol,
        interval: index === 0 ? 'D' : '5',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        allow_symbol_change: false,
        calendar: false,
        hide_side_toolbar: index !== 0,
        hide_top_toolbar: index !== 0,
        backgroundColor: '#0a0a0a',
        gridColor: 'rgba(255, 255, 255, 0.06)',
        withdateranges: index === 0,
        range: index === 0 ? '1M' : '1D',
        save_image: index === 0,
        support_host: 'https://www.tradingview.com',
      });

      chartRef.innerHTML = '';
      chartRef.appendChild(script);
    });

    return () => {
      Object.values(chartRefs.current).forEach((ref) => {
        if (ref) {
          ref.innerHTML = '';
        }
      });
    };
  }, []);

  useEffect(() => {
    // GSAP animations
    if (sliderRef.current) {
      gsap.fromTo(
        sliderRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.4 }
      );
    }
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === chartTabs.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    // Auto-slide interval
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(slideInterval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
              Elevate Your{' '}
              <span className="text-primary">Trading</span>
              {' '}with Advanced Institutional Indicators
            </h1>
            <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Trade in Forex, Cryptocurrencies, Index, and Stocks effortlessly. Our indicators identify 'bottoms' and 'tops' thanks to advanced Artificial Intelligence, adapting and updating according to market trends, enhancing your profits.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button 
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6"
            >
              <Link to="/dashboard">Early Access</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary text-foreground hover:bg-primary/10 hover:border-primary text-lg px-8 py-6"
            >
              <Link to="/dashboard">Join Now</Link>
            </Button>
          </motion.div>

          {/* Trading Chart Dashboard - Features Detail Style */}
          <div
            ref={sliderRef}
            className="relative h-[80vh] overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {chartTabs.map((tab, index) => {
                const position = index - currentSlide;
                const isActive = position === 0;
                const zIndex = isActive ? 30 : 20 - Math.abs(position);
                const scale = isActive ? 1 : 1 - 0.1;
                const translateX = position * 100;

                return (
                  <div
                    key={tab.id}
                    className={`absolute transition-all duration-500 ease-in-out rounded-2xl border-4 ${
                      isActive ? 'border-primary/50' : 'border-primary/20'
                    } ${isActive ? 'shadow-2xl shadow-primary/20' : 'shadow-md'}`}
                    style={{
                      transform: `translateX(${translateX}%) scale(${scale})`,
                      zIndex,
                    }}
                  >
                    <div className="relative aspect-[16/9] w-[70vw] max-w-full rounded-2xl overflow-hidden bg-card">
                      {/* Chart Header Info */}
                      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-white text-sm">
                        <span className="font-medium">{tab.label}</span>
                        <div className="flex items-center gap-4 text-xs">
                          <span>O 63243.56</span>
                          <span>H 67769.00</span>
                          <span>L 67769.00</span>
                          <span className="text-primary">L 6.72%</span>
                        </div>
                      </div>

                      {/* TradingView Widget */}
                      <div
                        ref={(el) => {
                          chartRefs.current[tab.id] = el;
                        }}
                        className="tradingview-widget-container"
                        style={{ height: '100%', width: '100%' }}
                      />

                      {/* Overlay Indicators for first chart */}
                      {isActive && index === 0 && (
                        <div className="absolute inset-0 pointer-events-none">
                          {/* Support Line */}
                          <div className="absolute left-0 right-0 bottom-20 border-t-2 border-green-500/50">
                            <span className="absolute left-4 -top-3 text-xs text-green-500 bg-card/80 px-2 py-1 rounded">
                              Support
                            </span>
                          </div>
                          
                          {/* Resistance Line */}
                          <div className="absolute left-0 right-0 top-20 border-t-2 border-dashed border-red-500/50">
                            <span className="absolute left-4 -top-3 text-xs text-red-500 bg-card/80 px-2 py-1 rounded">
                              Resistance
                            </span>
                          </div>

                          {/* Tooltip */}
                          <div className="absolute top-1/3 right-1/4 bg-card/90 border border-primary/50 rounded-lg p-3 max-w-xs pointer-events-auto">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <p className="text-xs text-white">
                                This indicator is based on identifying the divergence with the DXY without the need for 2 charts!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-8 mt-8">
            {chartTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => goToSlide(index)}
                className={`p-2 text-sm font-medium transition-all ${
                  currentSlide === index
                    ? 'text-primary'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
