'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

import { useAppSelector } from '@/hooks/useAppSelector';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 z-[100] w-full transition-all duration-300 ${isScrolled ? 'bg-background/80  backdrop-blur-md h-16' : 'bg-transparent h-20'}`}>
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="text-primary fill-primary" size={24} />
            <span className="font-sora text-2xl font-bold tracking-tighter">SnapPay</span>
          </Link>
          
          {/* <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Security', 'Testimonials'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-foreground/40 transition-colors hover:text-primary">
                {item}
              </Link>
            ))}
          </div> */}

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {token ? (
              <Link href="/dashboard">
                <Button className="bg-primary text-background hover:bg-gold-glow font-bold">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary text-background hover:bg-gold-glow font-bold">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4 text-foreground">
            <ThemeToggle />
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-background pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {['Features', 'How It Works', 'Security', 'Testimonials'].map((item) => (
                <Link key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold">
                  {item}
                </Link>
              ))}
              <hr className="border-border" />
              {token ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary text-background font-bold">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-background font-bold">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
