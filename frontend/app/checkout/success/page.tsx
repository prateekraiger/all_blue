'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { paymentApi, Order } from '@/lib/api';
import { useStackApp } from '@stackframe/stack';

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-medium text-gray-700">Verifying your payment...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <div className="space-y-3">
            <Link 
              href="/orders" 
              className="block w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Go to My Orders
            </Link>
            <Link 
              href="/contact" 
              className="block w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-10 text-center text-white">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 scale-110 animate-pulse">
              <CheckCircle size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Order Confirmed!</h1>
            <p className="text-green-50 opacity-90 text-lg">
              Thank you for your purchase. Your order is being processed.
            </p>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Order Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Order Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-mono font-medium text-gray-900">#{orderId?.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-bold text-gray-900">₹{order?.total_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-600">Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                      {order?.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Shipping To</h3>
                {order?.address && (
                  <address className="not-italic text-gray-700 leading-relaxed">
                    <p className="font-bold text-gray-900 mb-1">{order.address.name}</p>
                    <p>{order.address.line1}</p>
                    {order.address.line2 && <p>{order.address.line2}</p>}
                    <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                    <p className="mt-2 text-sm text-gray-500">{order.address.phone}</p>
                  </address>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 mb-12 flex items-start gap-4 border border-blue-100">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Package size={20} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900">What happens next?</h4>
                <p className="text-blue-800 text-sm opacity-90 mt-1">
                  You will receive an email confirmation with your order details. We'll notify you once your gift is shipped!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/orders" 
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transform hover:-translate-y-1 transition-all shadow-lg"
              >
                View My Orders <ArrowRight size={18} />
              </Link>
              <Link 
                href="/shop" 
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transform hover:-translate-y-1 transition-all"
              >
                Continue Shopping <ShoppingBag size={18} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
