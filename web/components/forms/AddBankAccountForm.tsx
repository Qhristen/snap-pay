'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  useGetBanksQuery, 
  useVerifyAccountMutation, 
  useLinkBankAccountMutation 
} from '@/store/api/paymentApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Search, Landmark, CheckCircle2, AlertCircle } from 'lucide-react';

const bankAccountSchema = z.object({
  bankCode: z.string().min(1, 'Please select a bank'),
  accountNumber: z.string().length(10, 'Account number must be 10 digits'),
});

type BankAccountValues = z.infer<typeof bankAccountSchema>;

interface AddBankAccountFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddBankAccountForm({ onSuccess, onCancel }: AddBankAccountFormProps) {
  const { data: banksData, isLoading: isLoadingBanks } = useGetBanksQuery();
  const [verifyAccount, { isLoading: isVerifying }] = useVerifyAccountMutation();
  const [linkAccount, { isLoading: isLinking }] = useLinkBankAccountMutation();
  const banks = banksData?.data.data

  const [accountName, setAccountName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BankAccountValues>({
    resolver: zodResolver(bankAccountSchema),
  });

  const selectedBankCode = watch('bankCode');
  const accountNumber = watch('accountNumber');

  // Automatically verify account when bank and 10-digit number are provided
  useEffect(() => {
    if (selectedBankCode && accountNumber?.length === 10) {
      const timer = setTimeout(async () => {
        try {
          const result = await verifyAccount({ 
            accountNumber, 
            bankCode: selectedBankCode 
          }).unwrap();
          console.log(result.data, "result.data");
          setAccountName(result.data.accountName);
        } catch (error) {
          setAccountName(null);
          toast.error('Could not verify bank account');
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAccountName(null);
    }
  }, [selectedBankCode, accountNumber, verifyAccount]);

  const filteredBanks = banks?.filter(bank => 
    bank.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  ) || [];

  const onSubmit = async (data: BankAccountValues) => {
    if (!accountName) {
      toast.error('Please verify your account details first');
      return;
    }
    console.log(accountName, "accountName");
    console.log(data, "data");

    try {
      await linkAccount({
        bankCode: data.bankCode,
        accountNumber: data.accountNumber,
        accountName: accountName ?? "",
      }).unwrap();
      
      toast.success('Bank account linked successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to link bank account');
    }
  };

  const selectedBank = banks?.find(b => b.code === selectedBankCode);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Select Bank</label>
        <div className="relative">
          <div 
            className="w-full h-14 bg-white/5 border border-white/10 px-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all rounded-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center gap-3">
              <Landmark className="w-5 h-5 text-primary" />
              <span className={selectedBank ? 'text-white' : 'text-muted-foreground'}>
                {selectedBank ? selectedBank.name : 'Choose a bank'}
              </span>
            </div>
            <Search className="w-4 h-4 text-muted-foreground" />
          </div>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-[#0A0A0A] border border-white/10 shadow-2xl max-h-60 overflow-y-auto">
              <div className="p-2 sticky top-0 bg-[#0A0A0A] border-b border-white/5">
                <input
                  type="text"
                  placeholder="Search banks..."
                  className="w-full bg-white/5 border-none px-3 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {filteredBanks.map((bank, i) => (
                <div
                  key={i}
                  className="px-4 py-3 hover:bg-primary/10 cursor-pointer text-sm text-white flex items-center justify-between"
                  onClick={() => {
                    setValue('bankCode', bank.code);
                    setIsDropdownOpen(false);
                  }}
                >
                  {bank.name}
                  {selectedBankCode === bank.code && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
              ))}
            </div>
          )}
        </div>
        {errors.bankCode && <p className="text-xs text-destructive mt-1">{errors.bankCode.message}</p>}
      </div>

      <Input
        label="Account Number"
        placeholder="0123456789"
        maxLength={10}
        error={errors.accountNumber?.message}
        {...register('accountNumber')}
      />

      {isVerifying && (
        <div className="flex items-center gap-2 text-primary animate-pulse">
          <div className="w-2 h-2 bg-primary rounded-full" />
          <span className="text-xs font-bold uppercase tracking-widest">Verifying Account...</span>
        </div>
      )}

      {accountName && (
        <div className="p-4 bg-primary/5 border border-primary/20 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">Account Verified</p>
            <p className="text-lg font-mono font-bold text-white mt-1">{accountName}</p>
          </div>
        </div>
      )}

      {!isVerifying && accountNumber?.length === 10 && !accountName && selectedBankCode && (
        <div className="p-4 bg-destructive/5 border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <p className="text-xs font-bold text-destructive uppercase tracking-widest">Verification Failed</p>
            <p className="text-sm text-muted-foreground mt-1">Please check the account number and bank</p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1 h-14 border-white/10" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          className="flex-1 h-14 bg-primary text-background font-bold text-lg hover:bg-gold-glow"
          isLoading={isLinking}
          disabled={!accountName}
        >
          Link Account
        </Button>
      </div>
    </form>
  );
}
