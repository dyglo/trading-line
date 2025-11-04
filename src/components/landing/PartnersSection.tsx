import { motion } from 'framer-motion';

const partners = [
  { name: 'BYBIT', logo: 'BYBIT' },
  { name: 'BINANCE', logo: 'BINANCE' },
  { name: 'Bitcoin', logo: '₿' },
  { name: 'Meta', logo: 'Meta' },
  { name: 'BingX', logo: 'BingX' },
];

export const PartnersSection = () => {
  return (
    <section className="py-12 sm:py-16 bg-background border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-foreground/60 hover:text-foreground transition-colors text-xl sm:text-2xl font-semibold"
            >
              {partner.logo === '₿' ? (
                <span className="text-3xl sm:text-4xl">{partner.logo}</span>
              ) : (
                <span>{partner.name}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

