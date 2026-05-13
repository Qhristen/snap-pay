import { TransferForm } from '@/components/forms/TransferForm';

export default function TransferPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transfer</h1>
        <p className="text-muted-foreground">Send money to other SnapPay users instantly.</p>
      </div>
      <TransferForm />
    </div>
  );
}
