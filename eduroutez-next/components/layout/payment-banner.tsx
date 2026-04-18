import React, { useState } from 'react';
import loadRazorpayScript from '@/lib/razorpay';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';

interface PaymentBannerProps {
  onPaymentSuccess: () => void;
}

const PaymentBanner: React.FC<PaymentBannerProps> = ({ onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    const res = await loadRazorpayScript();
    if (!res) {
      setError('Razorpay SDK failed to load.');
      setLoading(false);
      return;
    }
    try {
      // Call backend to create order
      const { data } = await axiosInstance.post('/payment/create-order', {
        amount: 99 * 100, // in paise
        currency: 'INR',
        purpose: 'Counsellor Verification Test'
      });
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Guidance Y',
        description: 'Verification Test Fee',
        order_id: data.id,
        handler: async function (response: any) {
          // Call backend to verify payment
          await axiosInstance.post('/payment/verify', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
          onPaymentSuccess();
        },
        prefill: {},
        theme: { color: '#6366f1' },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError('Payment initiation failed.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
      <div>
        <strong>Guidance Y:</strong> You need to be verified. Please pay ₹99 to take the verification test.
      </div>
      <Button onClick={handlePayment} disabled={loading} className="bg-primary">
        {loading ? 'Processing...' : 'Pay ₹99 & Start Test'}
      </Button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default PaymentBanner;
