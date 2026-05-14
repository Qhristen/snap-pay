'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Send, CreditCard, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { DepositForm } from '@/components/forms/DepositForm';
import { TransferForm } from '@/components/forms/TransferForm';
import { WithdrawForm } from '@/components/forms/WithdrawForm';

type ModalType = 'deposit' | 'transfer' | 'withdraw' | null;

const actions = [
  { label: 'Deposit', key: 'deposit' as const, icon: Plus, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Transfer', key: 'transfer' as const, icon: Send, color: 'text-foreground', bg: 'bg-foreground/5' },
  { label: 'Withdraw', key: 'withdraw' as const, icon: CreditCard, color: 'text-foreground', bg: 'bg-foreground/5' },
  { label: 'History', key: 'history' as const, icon: History, color: 'text-foreground', bg: 'bg-foreground/5' },
];

export function QuickActions() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {action.key === 'history' ? (
              <Link
                href="/transactions"
                className="group flex flex-col items-center gap-3 p-4 border border-border bg-surface transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 active:scale-95 cursor-pointer"
              >
                <div className={`flex h-14 w-14 items-center justify-center ${action.bg} border border-border transition-transform group-hover:scale-110`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <span className="text-xs font-bold text-foreground/40 group-hover:text-foreground transition-colors tracking-tight uppercase">{action.label}</span>
              </Link>
            ) : (
              <button
                onClick={() => setActiveModal(action.key)}
                className="group flex flex-col items-center gap-3 p-4 border border-border bg-surface transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 active:scale-95 cursor-pointer w-full"
              >
                <div className={`flex h-14 w-14 items-center justify-center ${action.bg} border border-border transition-transform group-hover:scale-110`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <span className="text-xs font-bold text-foreground/40 group-hover:text-foreground transition-colors tracking-tight uppercase">{action.label}</span>
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Deposit Modal */}
      <Modal isOpen={activeModal === 'deposit'} onClose={closeModal} title="Deposit Funds">
        <DepositForm onSuccess={closeModal} />
      </Modal>

      {/* Transfer Modal */}
      <Modal isOpen={activeModal === 'transfer'} onClose={closeModal} title="Send Money">
        <TransferForm onSuccess={closeModal} />
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={activeModal === 'withdraw'} onClose={closeModal} title="Withdraw Funds">
        <WithdrawForm onSuccess={closeModal} />
      </Modal>
    </>
  );
}
