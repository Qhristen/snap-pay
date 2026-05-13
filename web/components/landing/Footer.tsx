'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Zap className="text-primary fill-primary" size={24} />
              <span className="font-sora text-2xl font-bold tracking-tighter">SnapPay</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              The smarter wallet for modern Africans — instant transfers, real-time balance, zero stress.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                <div key={social} className="h-8 w-8 bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-primary cursor-pointer transition-colors">
                  <div className="h-4 w-4 bg-current" />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link href="#features" className="hover:text-primary">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-primary">How It Works</Link></li>
              <li><Link href="#security" className="hover:text-primary">Security</Link></li>
              <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link href="#" className="hover:text-primary">About</Link></li>
              <li><Link href="#" className="hover:text-primary">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-white/40">
              <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-white/40">© 2026 SnapPay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
