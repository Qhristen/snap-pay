'use client';

import { motion } from 'framer-motion';

const Step = ({ number, title, description, index }: { number: string, title: string, description: string, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="relative flex flex-col items-center text-center md:items-start md:text-left"
    >
      <span className="font-mono text-5xl font-bold text-primary/20 mb-4 md:text-6xl">{number}</span>
      <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-foreground/40">{description}</p>
    </motion.div>
  );
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface py-24 md:py-32 relative overflow-hidden">
      {/* Connecting line (desktop) */}
      <div className="absolute top-[45%] left-[20%] right-[20%] h-[2px] hidden md:block" />
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-16 text-center">
          <h2 className="font-sora text-4xl font-bold text-foreground md:text-5xl">Up and running in 60 seconds.</h2>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          <Step 
            number="01" 
            title="Create Your Account" 
            description="Register with your email, set a password, and your wallet is auto-created instantly." 
            index={0}
          />
          <Step 
            number="02" 
            title="Fund Your Wallet" 
            description="Deposit funds directly into your SnapPay wallet with a single tap." 
            index={1}
          />
          <Step 
            number="03" 
            title="Send & Receive Freely" 
            description="Transfer to any user, track every transaction, get notified in real-time." 
            index={2}
          />
        </div>
      </div>
    </section>
  );
}
