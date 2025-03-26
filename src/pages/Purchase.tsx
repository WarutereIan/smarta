import { useState } from 'react';
import { Droplet, CreditCard, X } from 'lucide-react';

interface PurchaseHistory {
  id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  reference: string;
}

export default function Purchase() {
  const [tokenAmount, setTokenAmount] = useState('50');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pricePerToken = 10;

  // Mock purchase history
  const purchaseHistory: PurchaseHistory[] = [
    {
      id: 1,
      amount: 100,
      status: 'completed',
      date: '2024-03-12',
      reference: 'PXA7YHN9',
    },
    {
      id: 2,
      amount: 50,
      status: 'pending',
      date: '2024-03-11',
      reference: 'MKL4WQR2',
    },
  ];

  const quickAmounts = [20, 50, 100, 200];

  const handleAmountChange = (value: string) => {
    setError(null);
    const numValue = Number(value);
    if (numValue < 10) {
      setError('Minimum token amount is 10');
    } else if (numValue > 1000) {
      setError('Maximum token amount is 1000');
    }
    setTokenAmount(value);
  };

  const handlePurchase = async () => {
    if (error) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowConfirmation(false);
      // Handle success
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Droplet className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold ml-2">Purchase Tokens</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label htmlFor="tokens" className="block text-sm font-medium text-gray-700">
            Enter Token Amount
          </label>
          <div className="flex gap-2 mb-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountChange(amount.toString())}
                className={`px-4 py-2 rounded-md ${
                  tokenAmount === amount.toString()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {amount}
              </button>
            ))}
          </div>
          <input
            type="number"
            id="tokens"
            value={tokenAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter amount"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="bg-gray-50 rounded-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Transaction Summary:</h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Tokens:</span>
            <span className="font-medium">{tokenAmount}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Price per Token:</span>
            <span className="font-medium">KSh {pricePerToken}</span>
          </div>
          <div className="border-t border-gray-200 my-2 pt-2">
            <div className="flex justify-between">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-semibold text-blue-600">
                KSh {Number(tokenAmount) * pricePerToken}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowConfirmation(true)}
          disabled={loading || !!error}
          className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
            loading || error
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <CreditCard className="h-5 w-5 mr-2" />
          {loading ? 'Processing...' : 'Pay with M-Pesa'}
        </button>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Purchase History</h3>
          <div className="space-y-4">
            {purchaseHistory.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-gray-50 rounded-md p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{purchase.amount} Tokens</p>
                  <p className="text-sm text-gray-500">
                    {purchase.date} • Ref: {purchase.reference}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    purchase.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : purchase.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Purchase</h3>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4">
              Are you sure you want to purchase {tokenAmount} tokens for KSh{' '}
              {Number(tokenAmount) * pricePerToken}?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-md ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}