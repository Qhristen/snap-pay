import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  labelRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, labelRight, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';

    const togglePasswordVisibility = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPassword(!showPassword);
    };

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-2 text-left">
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 transition-colors group-focus-within:text-primary">
              {label}
            </label>
          )}
          {labelRight && <div className="text-xs">{labelRight}</div>}
        </div>
        <div className="relative group/input">
          <input
            type={inputType}
            className={cn(
              'flex h-11 w-full border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-white/20 focus:bg-white/[0.07] focus:border-primary/30',
              error && 'border-destructive/40 focus-visible:ring-destructive/40 hover:border-destructive/50',
              isPassword && 'pr-11',
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/40 hover:text-white transition-all p-1.5 rounded-md hover:bg-white/5"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && <p className="text-[11px] font-bold text-destructive animate-in fade-in slide-in-from-top-1 px-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
