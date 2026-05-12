'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag, Truck, ChevronRight } from 'lucide-react';
import { paymentApi, Order } from '@/lib/api';
import { useStackApp } from '@stackframe/stack';
import { motion } from 'framer-motion';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stack = useStackApp();
  const user = stack.useUser();
  
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId || !orderId) {
        setError('Missing payment information.');
        setLoading(false);
        return;
      }

      try {
        const token = await user?.getAccessToken();
        if (!token) throw new Error('Not authenticated');

        const response = await paymentApi.verify({
          session_id: sessionId,
          order_id: orderId
        }, token);

        setOrder(response.order);
      } catch (err: any) {
        console.error('Payment verification failed:', err);
        setError(err.message || 'Failed to verify payment.');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      verifyPayment();
    }
  }, [sessionId, orderId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#E5E5E5] border-t-[#111111] rounded-full animate-spin mb-6" />
        <h2 className="text-[18px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          Verifying your payment...
        </h2>
        <p className="text-[14px] text-[#707072] mt-2" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          Please wait while we confirm your order.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
            <Package className="w-7 h-7 text-[#D30005]" />
          </div>
          <h1 className="nike-display text-[32px] md:text-[48px] text-[#111111] mb-4">
            SOMETHING WENT WRONG
          </h1>
          <p className="text-[16px] text-[#707072] mb-10 leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            {error}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders" className="nike-btn-primary text-[14px] px-8 py-3.5">
              Go to My Orders
            </Link>
            <Link href="/contact" className="nike-btn-secondary text-[14px] px-8 py-3.5">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] text-[#707072] mb-8" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          <Link href="/" className="hover:text-[#111111] transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3 h-3 text-[#CACACB]" />
          <span className="text-[#111111] font-medium">Order Confirmed</span>
        </nav>

        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 md:mb-16"
          >
            <div className="w-20 h-20 bg-[#007D48]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#007D48]" />
            </div>
            <h1 className="nike-display text-[32px] md:text-[48px] lg:text-[64px] text-[#111111] mb-4">
              ORDER CONFIRMED
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#707072] max-w-xl mx-auto leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
              Thank you for your purchase. Your order is being processed and you&apos;ll receive an email confirmation shortly.
            </p>
          </motion.div>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          >
            {/* Order Info */}
            <div className="bg-[#F5F5F5] p-6 md:p-8">
              <h3 className="text-[12px] font-medium text-[#707072] mb-6 uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Order Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #E5E5E5' }}>
                  <span className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Order ID</span>
                  <span className="text-[14px] font-medium text-[#111111] font-mono" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    #{orderId?.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #E5E5E5' }}>
                  <span className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Amount Paid</span>
                  <span className="text-[14px] font-medium text-[#111111]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    ₹{order?.total_amount?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[14px] text-[#707072]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Status</span>
                  <span className="text-[14px] font-medium text-[#007D48] uppercase" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                    {order?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-[#F5F5F5] p-6 md:p-8">
              <h3 className="text-[12px] font-medium text-[#707072] mb-6 uppercase tracking-wider" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                Shipping To
              </h3>
              {order?.address && (
                <address className="not-italic space-y-1" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                  <p className="text-[16px] font-medium text-[#111111] mb-2">{order.address.name}</p>
                  <p className="text-[14px] text-[#707072]">{order.address.line1}</p>
                  {order.address.line2 && <p className="text-[14px] text-[#707072]">{order.address.line2}</p>}
                  <p className="text-[14px] text-[#707072]">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                  <p className="text-[14px] text-[#707072] mt-2">{order.address.phone}</p>
                </address>
              )}
            </div>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#F5F5F5] p-6 md:p-8 mb-12 flex items-start gap-4"
          >
            <div className="w-10 h-10 bg-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#111111]" />
            </div>
            <div>
              <h4 className="text-[16px] font-medium text-[#111111] mb-1" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                What happens next?
              </h4>
              <p className="text-[14px] text-[#707072] leading-relaxed" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
                You will receive an email confirmation with your order details. We&apos;ll notify you once your gift is shipped!
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/orders" className="nike-btn-primary flex-1 text-[16px] py-4 text-center">
              View My Orders <ArrowRight className="w-4 h-4 inline ml-2" />
            </Link>
            <Link href="/shop" className="nike-btn-secondary flex-1 text-[16px] py-4 text-center">
              Continue Shopping <ShoppingBag className="w-4 h-4 inline ml-2" />
            </Link>
          </motion.div>

          {/* Back Home */}
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[14px] text-[#707072] hover:text-[#111111] transition-colors font-medium"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              <Home className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
