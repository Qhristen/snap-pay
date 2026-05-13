import { WithdrawForm } from '@/components/forms/WithdrawForm';

export default function WithdrawPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdraw</h1>
        <p className="text-muted-foreground">Withdraw funds from your wallet to your bank account.</p>
      </div>
      <WithdrawForm />
    </div>
  );
}
