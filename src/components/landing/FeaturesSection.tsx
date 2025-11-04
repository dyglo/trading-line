import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Shield,
  LineChart
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Real-Time Market Data',
    description: 'Live price feeds for stocks, forex, crypto, and commodities with instant updates every 3 seconds.',
  },
  {
    icon: DollarSign,
    title: '$10,000 Virtual Capital',
    description: 'Practice trading strategies without financial risk. Start with a fully-funded demo account instantly.',
  },
  {
    icon: BarChart3,
    title: 'Professional Tools',
    description: 'Advanced TradingView charts, multiple order types (Market, Limit, Stop), and comprehensive analytics.',
  },
  {
    icon: Activity,
    title: 'Performance Analytics',
    description: 'Track P&L, win rate, profit factor, and equity curves in real-time as you trade.',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Set stop-loss and take-profit levels automatically. Protect your capital while learning.',
  },
  {
    icon: LineChart,
    title: '25+ Trading Instruments',
    description: 'Trade stocks, forex pairs, cryptocurrencies, commodities, and indices all in one platform.',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Everything You Need to Learn Trading
          </h2>
          <p className="text-lg text-muted-foreground">
            Professional-grade tools and features designed to help you master trading strategies safely.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-tight">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
