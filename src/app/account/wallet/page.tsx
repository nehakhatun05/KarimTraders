'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift,
  ChevronRight,
  CreditCard,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: string;
  status: string;
}

export default function WalletPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/wallet');
      return;
    }

    if (authStatus === 'authenticated') {
      fetchWallet();
    }
  }, [authStatus, router]);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/wallet');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance || 0);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = () => {
    if (!amount || parseInt(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    // TODO: Integrate with payment gateway
    toast.success('Add money feature coming soon!');
    setShowAddMoney(false);
    setAmount('');
  };

  const quickAmounts = [100, 200, 500, 1000];

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight size={16} />
            <Link href="/account" className="hover:text-primary-600">Account</Link>
            <ChevronRight size={16} />
            <span className="text-gray-800">My Wallet</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">My Wallet</h1>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Balance Card & Add Money */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-white/80 text-sm">Available Balance</p>
                  <p className="text-3xl font-bold">₹{balance}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMoney(true)}
                className="w-full py-3 bg-white text-primary-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Plus size={20} />
                Add Money
              </button>
            </div>

            {/* Add Money Modal/Card */}
            {showAddMoney && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Add Money to Wallet</h3>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Enter Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 text-2xl font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        amount === amt.toString()
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddMoney(false);
                      setAmount('');
                    }}
                    className="flex-1 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMoney}
                    className="flex-1 btn-primary"
                  >
                    Proceed
                  </button>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-colors">
                  <Gift className="text-primary-600" size={24} />
                  <span className="text-sm text-gray-600">Gift Card</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-colors">
                  <CreditCard className="text-primary-600" size={24} />
                  <span className="text-sm text-gray-600">Link Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-800">Transaction History</h3>
              </div>
              
              {transactions.length > 0 ? (
                <div className="divide-y">
                  {transactions.map((txn) => {
                    const txnDate = new Date(txn.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    });
                    return (
                      <div key={txn.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          txn.type === 'CREDIT' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {txn.type === 'CREDIT' 
                            ? <ArrowDownLeft size={20} /> 
                            : <ArrowUpRight size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800">{txn.description}</p>
                          <p className="text-sm text-gray-500">{txnDate}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount}
                          </p>
                          <div className="flex items-center gap-1 text-xs">
                            {txn.status === 'COMPLETED' ? (
                              <>
                                <CheckCircle size={12} className="text-green-500" />
                                <span className="text-green-600">Completed</span>
                              </>
                            ) : (
                              <>
                                <Clock size={12} className="text-yellow-500" />
                                <span className="text-yellow-600">Pending</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No transactions yet</p>
                  <p className="text-sm text-gray-400 mt-1">Your wallet transactions will appear here</p>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="mt-6 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Wallet Benefits</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-secondary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span>⚡</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Instant Checkout</p>
                    <p className="text-sm text-gray-600">Pay faster with wallet</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-secondary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span>🎁</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Extra Cashback</p>
                    <p className="text-sm text-gray-600">Get up to 5% extra</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-secondary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span>🔒</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Secure</p>
                    <p className="text-sm text-gray-600">100% secure payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
