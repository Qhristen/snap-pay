import { DepositForm } from '@/components/forms/DepositForm';

export default function DepositPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deposit</h1>
        <p className="text-muted-foreground">Add funds to your SnapPay wallet.</p>
      </div>
      <DepositForm />
    </div>
  );
}
