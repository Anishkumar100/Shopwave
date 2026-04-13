import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verify = async () => {
      const cfOrderId = searchParams.get('order_id');
      const orderId = sessionStorage.getItem('pendingOrderId');
      const storedCfId = sessionStorage.getItem('cfOrderId');
      if (!cfOrderId && !orderId) { navigate('/orders'); return; }
      try {
        const { data } = await API.post('/payment/verify', {
          orderId: cfOrderId || storedCfId,
          cfOrderId: storedCfId,
        });
        if (data.paymentStatus === 'SUCCESS') {
          if (orderId) {
            await API.put(`/orders/${orderId}/pay`, {
              cfOrderId: storedCfId, orderId: cfOrderId,
              paymentStatus: 'SUCCESS', paymentTime: new Date().toISOString(), txId: data.payment?.cf_payment_id,
            });
          }
          sessionStorage.removeItem('pendingOrderId');
          sessionStorage.removeItem('cfOrderId');
          setStatus('success');
          toast.success('Payment successful! 🎉');
          setTimeout(() => navigate(orderId ? `/orders/${orderId}` : '/orders'), 3000);
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };
    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-12 border border-base text-center max-w-md w-full mx-4">
        {status === 'verifying' && (
          <>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-brand border-t-brand rounded-full mx-auto mb-6" />
            <h2 className="font-display font-bold text-2xl text-base-c mb-2">Verifying Payment</h2>
            <p className="text-muted-c">Please wait, do not close this window...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <CheckCircle className="w-20 h-20 text-brand mx-auto mb-6" />
            </motion.div>
            <h2 className="font-display font-bold text-3xl text-base-c mb-2">Payment Successful!</h2>
            <p className="text-muted-c mb-6">Your order has been placed. Redirecting to your order...</p>
            <div className="w-full bg-surface rounded-full h-1.5">
              <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3 }}
                className="bg-brand h-1.5 rounded-full" />
            </div>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="font-display font-bold text-3xl text-base-c mb-2">Payment Failed</h2>
            <p className="text-muted-c mb-6">Something went wrong with your payment.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/cart')} className="btn-outline py-3 px-6">Back to Cart</button>
              <button onClick={() => navigate('/checkout')} className="btn-primary py-3 px-6">Try Again</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
export default PaymentVerify;
