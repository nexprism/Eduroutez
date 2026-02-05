import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
    password?: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
    const requirements = [
        { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
        { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
        { label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
        { label: 'Contains number or special character', test: (p: string) => /[\d!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];

    const strength = useMemo(() => {
        if (!password) return 0;
        return requirements.reduce((acc, req) => (req.test(password) ? acc + 1 : acc), 0);
    }, [password]);

    const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = [
        'bg-gray-200',
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-green-500',
    ][strength];

    return (
        <div className="mt-2 space-y-3">
            {/* Strength Bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">Security Strength</span>
                    <span className={cn("text-xs font-bold",
                        strength <= 1 ? "text-red-500" :
                            strength === 2 ? "text-orange-500" :
                                strength === 3 ? "text-yellow-600" : "text-green-600"
                    )}>
                        {strengthLabel}
                    </span>
                </div>
                <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={cn(
                                "h-full flex-1 transition-all duration-300",
                                strength >= step ? strengthColor : "bg-transparent"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pl-1">
                {requirements.map((req, index) => {
                    const isMet = req.test(password);
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <div className={cn(
                                "p-0.5 rounded-full flex items-center justify-center",
                                isMet ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                            )}>
                                {isMet ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                            </div>
                            <span className={cn(
                                "text-[10px] leading-none",
                                isMet ? "text-green-700 font-medium" : "text-gray-500"
                            )}>
                                {req.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PasswordStrength;
