import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Search, 
  ShoppingCart, 
  Eye, 
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

const steps = [
  {
    number: 1,
    icon: DollarSign,
    title: 'Start with $10,000',
    description: 'Your demo account is instantly funded with $10,000 in virtual capital. No registration or credit card required.',
    color: 'text-long',
    bgColor: 'bg-long/10',
  },
  {
    number: 2,
    icon: Search,
    title: 'Search & Analyze',
    description: 'Browse 25+ trading instruments including stocks, forex, crypto, and commodities. Use professional charts to analyze market trends.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    number: 3,
    icon: ShoppingCart,
    title: 'Place Your Order',
    description: 'Execute Market orders instantly or set Limit/Stop orders. Set stop-loss and take-profit levels to manage risk.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    number: 4,
    icon: Eye,
    title: 'Monitor Live Positions',
    description: 'Watch your trades update in real-time. See P&L calculations as market prices change every 3 seconds.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    number: 5,
    icon: BarChart3,
    title: 'Track Performance',
    description: 'Analyze your strategy with win rate, profit factor, and detailed trade history. Learn from every trade.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-20 sm:py-24 lg:py-32 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started with paper trading in five simple steps. Learn at your own pace with our intuitive platform.
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          <div className="hidden md:grid md:grid-cols-5 gap-6 mb-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              
              return (
                <motion.button
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setActiveStep(index)}
                  className={`relative rounded-2xl border-2 p-6 text-left transition-all ${
                    isActive
                      ? 'border-primary bg-card shadow-lg scale-105'
                      : 'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${step.bgColor} ${step.color} transition-transform ${isActive ? 'scale-110' : ''}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Step {step.number}</span>
                    {isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeStep"
                      className="absolute inset-0 rounded-2xl border-2 border-primary bg-primary/5 -z-10"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="md:hidden space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              
              return (
                <motion.button
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setActiveStep(index)}
                  className={`w-full rounded-2xl border-2 p-6 text-left transition-all ${
                    isActive
                      ? 'border-primary bg-card shadow-lg'
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${step.bgColor} ${step.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Step {step.number}</span>
                        {isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <h3 className="mb-2 text-lg font-semibold tracking-tight">{step.title}</h3>
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-sm text-muted-foreground leading-relaxed"
                        >
                          {step.description}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
