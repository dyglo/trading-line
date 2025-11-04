import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Infinity,
  CheckCircle2
} from 'lucide-react';

const benefits = [
  {
    icon: Zap,
    stat: 'Real-time',
    description: 'Balance updates instantly with every trade',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: TrendingUp,
    stat: '25+',
    description: 'Trading instruments across all major markets',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: BarChart3,
    stat: 'Professional',
    description: 'Grade charting and analytics tools',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Infinity,
    stat: 'Unlimited',
    description: 'Practice trades with no restrictions',
    color: 'text-long',
    bgColor: 'bg-long/10',
  },
];

const keyFeatures = [
  'Advanced order types (Market, Limit, Stop)',
  'Automatic stop-loss and take-profit execution',
  'Comprehensive performance analytics',
  'Trade history and learning insights',
  'Professional TradingView integration',
  'Real-time P&L calculations',
];

export const BenefitsSection = () => {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 text-foreground">
            Why Choose T-Line?
          </h2>
          <p className="text-lg text-foreground/80">
            Experience professional-grade trading tools designed for learning and strategy development.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.stat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/50 via-primary/30 to-transparent overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(252,211,77,0.4)]"
              >
                {/* Inner transparent card */}
                <div className="relative h-full rounded-2xl backdrop-blur-md border border-primary/20 p-6 text-center transition-all duration-300 group-hover:border-primary/40">
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${benefit.bgColor} ${benefit.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="mb-2 text-3xl font-bold tracking-tight text-foreground">{benefit.stat}</div>
                  <p className="text-sm text-foreground/70">{benefit.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto max-w-3xl"
        >
          <div className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/50 via-primary/30 to-transparent overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(252,211,77,0.4)]">
            <div className="relative rounded-2xl backdrop-blur-md border border-primary/20 p-8 transition-all duration-300 group-hover:border-primary/40">
              <h3 className="mb-6 text-center text-2xl font-semibold tracking-tight text-foreground">
                Everything You Need to Succeed
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {keyFeatures.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-long" />
                    <span className="text-sm text-foreground/70">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
