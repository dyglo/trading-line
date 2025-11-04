import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Settings, 
  Shield, 
  Target,
  ArrowRight
} from 'lucide-react';

const learningPillars = [
  {
    icon: BookOpen,
    title: 'Trading Basics',
    description: 'Build a solid foundation in trading fundamentals',
    topics: [
      'Understanding order types (Market, Limit, Stop)',
      'Long vs Short positions explained',
      'Reading charts and price movements',
      'Market terminology and concepts',
    ],
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Settings,
    title: 'Platform Features',
    description: 'Master all the tools at your disposal',
    topics: [
      'How to place and manage orders',
      'Using stop-loss and take-profit effectively',
      'Interpreting the analytics dashboard',
      'Navigating charts and market data',
    ],
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Protect your capital while maximizing gains',
    topics: [
      'Position sizing strategies',
      'Setting stop-losses effectively',
      'Managing portfolio exposure',
      'Risk-reward ratios explained',
    ],
    color: 'text-long',
    bgColor: 'bg-long/10',
  },
  {
    icon: Target,
    title: 'Strategy Development',
    description: 'Develop and refine your trading approach',
    topics: [
      'Backtesting your approach',
      'Analyzing win rate and profit factor',
      'Learning from trade history',
      'Building consistent trading habits',
    ],
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

export const EducationalResources = () => {
  return (
    <section id="learn" className="py-20 sm:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4 text-foreground">
            Comprehensive Learning Resources
          </h2>
          <p className="text-lg text-foreground/80">
            Everything you need to go from beginner to confident trader, all in one place.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-12">
          {learningPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/50 via-primary/30 to-transparent overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(252,211,77,0.4)]"
              >
                {/* Inner transparent card */}
                <div className="relative h-full rounded-2xl backdrop-blur-md border border-primary/20 p-6 transition-all duration-300 group-hover:border-primary/40">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${pillar.bgColor} ${pillar.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">{pillar.title}</h3>
                  <p className="mb-4 text-sm text-foreground/70">{pillar.description}</p>
                  
                  <ul className="space-y-2">
                    {pillar.topics.map((topic, topicIndex) => (
                      <motion.li
                        key={topicIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 + topicIndex * 0.05 }}
                        className="flex items-start gap-2 text-xs text-foreground/60"
                      >
                        <ArrowRight className="mt-1 h-3 w-3 flex-shrink-0 text-primary" />
                        <span>{topic}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 group relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/50 via-primary/30 to-transparent overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(252,211,77,0.4)]"
        >
          <div className="relative rounded-2xl backdrop-blur-md border border-primary/20 p-8 text-center transition-all duration-300 group-hover:border-primary/40">
            <p className="text-lg font-medium mb-2 text-foreground">
              Ready to start learning?
            </p>
            <p className="text-sm text-foreground/70">
              Access all these resources and start practicing with your $10,000 demo account right away.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
