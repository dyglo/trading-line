import { motion } from 'framer-motion';
import { ArrowRight, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const trustIndicators = [
  { icon: Shield, text: '100% Secure' },
  { icon: CheckCircle2, text: 'Completely Free' },
  { icon: Lock, text: 'No Credit Card' },
];

export const CTASection = () => {
  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-background to-card/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 sm:p-12 shadow-lg"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Ready to Master Trading?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Start your journey with zero risk. Practice real strategies, learn from mistakes,
              and build confidence with our $10,000 demo account.
            </p>

            <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="group text-lg px-8 py-6">
                <Link to="/dashboard">
                  Access Demo Account Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {trustIndicators.map((indicator, index) => {
                const Icon = indicator.icon;
                return (
                  <motion.div
                    key={indicator.text}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{indicator.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
