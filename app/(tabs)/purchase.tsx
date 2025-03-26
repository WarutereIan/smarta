import React, { useState } from 'react';
import { Droplet, CreditCard, X, ChevronDown, ChevronUp } from 'lucide-react';

interface PurchaseHistory {
  amount: number;
  total: number;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
  mpesaRef: string;
  phoneNumber: string;
  breakdown: {
    subtotal: number;
    vat: number;
    serviceFee: number;
    total: number;
  };
  tokensReceived: number;
}

export default function PurchaseScreen() {
  const [tokenAmount, setTokenAmount] = useState('50');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(null);
  const pricePerToken = 10;

  // Mock purchase history with detailed information
  const [purchaseHistory] = useState<PurchaseHistory[]>([
    {
      amount: 100,
      total: 1000,
      date: '2024-02-20',
      time: '14:30:45',
      status: 'completed',
      mpesaRef: 'QWE123456',
      phoneNumber: '+254712345678',
      breakdown: {
        subtotal: 900,
        vat: 80,
        serviceFee: 20,
        total: 1000
      },
      tokensReceived: 100
    },
    {
      amount: 50,
      total: 500,
      date: '2024-02-18',
      time: '09:15:22',
      status: 'completed',
      mpesaRef: 'RTY789012',
      phoneNumber: '+254712345678',
      breakdown: {
        subtotal: 450,
        vat: 40,
        serviceFee: 10,
        total: 500
      },
      tokensReceived: 50
    },
    {
      amount: 75,
      total: 750,
      date: '2024-02-15',
      time: '16:45:33',
      status: 'failed',
      mpesaRef: 'UIO345678',
      phoneNumber: '+254712345678',
      breakdown: {
        subtotal: 675,
        vat: 60,
        serviceFee: 15,
        total: 750
      },
      tokensReceived: 0
    }
  ]);

  const quickAmounts = [50, 100, 200, 500];

  const handleAmountChange = (value: string) => {
    const numValue = Number(value);
    if (numValue < 0) {
      setError('Amount cannot be negative');
      return;
    }
    if (numValue > 1000) {
      setError('Maximum token purchase is 1000');
      return;
    }
    setError('');
    setTokenAmount(value);
  };

  const handlePurchase = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setShowConfirmation(false);
    // Here you would typically handle the actual M-Pesa payment
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="flex items-center mb-6 mt-10">
        <Droplet className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-semibold ml-2 text-gray-800">Purchase Tokens</h1>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-md">
        <label className="text-gray-500 text-lg mb-2 block">Enter Token Amount</label>
        
        {/* Quick amount selection */}
        <div className="flex gap-2 mb-4">
          {quickAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => handleAmountChange(amount.toString())}
              className={
                Number(tokenAmount) === amount
                  ? 'px-4 py-2 rounded-lg bg-blue-500 text-white'
                  : 'px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            >
              {amount}
            </button>
          ))}
        </div>

        <input
          type="number"
          className={
            error 
              ? 'w-full border border-red-500 rounded-lg p-3 text-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              : 'w-full border border-gray-200 rounded-lg p-3 text-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }
          value={tokenAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="Enter amount"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction Summary:</h2>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Tokens:</span>
            <span className="font-medium text-gray-800">{tokenAmount}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Price per Token:</span>
            <span className="font-medium text-gray-800">KSh {pricePerToken}</span>
          </div>
          <div className="h-px bg-gray-200 my-4" />
          <div className="flex justify-between">
            <span className="text-xl font-semibold text-gray-800">Total Amount:</span>
            <span className="text-xl font-bold text-blue-500">
              KSh {Number(tokenAmount) * pricePerToken}
            </span>
          </div>
        </div>

        <button
          onClick={() => !error && setShowConfirmation(true)}
          disabled={!!error || isLoading}
          className={
            error || isLoading
              ? 'w-full bg-blue-500 text-white p-4 rounded-lg flex items-center justify-center opacity-50 cursor-not-allowed'
              : 'w-full bg-blue-500 text-white p-4 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors'
          }
        >
          <CreditCard className="h-5 w-5" />
          <span className="ml-2 font-semibold">
            {isLoading ? 'Processing...' : 'Pay with M-Pesa'}
          </span>
        </button>

        {/* Purchase History */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Purchase History</h2>
          <div className="space-y-3">
            {purchaseHistory.map((purchase, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <div className="flex justify-between items-center cursor-pointer"
                     onClick={() => setExpandedTransaction(expandedTransaction === index ? null : index)}>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium text-gray-800">{purchase.tokensReceived} Tokens</p>
                      <p className={`ml-3 px-2 py-0.5 rounded text-sm ${
                        purchase.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : purchase.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(purchase.date).toLocaleDateString()} at {purchase.time}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-3">
                      <p className="font-medium text-gray-800">KSh {purchase.total}</p>
                      <p className="text-sm text-gray-500">Ref: {purchase.mpesaRef}</p>
                    </div>
                    {expandedTransaction === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Transaction Details */}
                {expandedTransaction === index && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Transaction Time</span>
                        <span className="text-gray-800">{purchase.time}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">M-Pesa Reference</span>
                        <span className="text-gray-800">{purchase.mpesaRef}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Phone Number</span>
                        <span className="text-gray-800">{purchase.phoneNumber}</span>
                      </div>
                      
                      <div className="my-3 border-t border-gray-200 pt-3">
                        <p className="font-medium text-gray-800 mb-2">Payment Breakdown</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-gray-800">KSh {purchase.breakdown.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">VAT (16%)</span>
                            <span className="text-gray-800">KSh {purchase.breakdown.vat}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Service Fee</span>
                            <span className="text-gray-800">KSh {purchase.breakdown.serviceFee}</span>
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
                            <span className="text-gray-800">Total Amount</span>
                            <span className="text-gray-800">KSh {purchase.breakdown.total}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tokens Received</span>
                          <span className="font-medium text-blue-600">{purchase.tokensReceived} Tokens</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Confirm Purchase</h3>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              You are about to purchase {tokenAmount} tokens for KSh {Number(tokenAmount) * pricePerToken}.
              An M-Pesa prompt will be sent to your phone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}