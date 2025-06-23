import { useState, useEffect } from 'react';
import { Droplet, CreditCard, X, CheckCircle, AlertTriangle, Clock, Receipt } from 'lucide-react';
import { 
  getPendingBills, 
  getPaymentHistory, 
  getCurrentTenant, 
  initiatePayment,
  checkPaymentStatus,
  formatCurrency,
  formatDate,
  formatPaymentHistory
} from '../lib/api';
import type { 
  Billing, 
  Payment, 
  PaymentHistory, 
  PaymentRequest,
  Tenant,
  MpesaPaymentResponse 
} from '../lib/types';

export default function Purchase() {
  const [pendingBills, setPendingBills] = useState<Billing[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [selectedBill, setSelectedBill] = useState<Billing | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<MpesaPaymentResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'bills' | 'history'>('bills');

  // Mock user ID - in real app, this would come from auth context
  const mockUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current tenant
        const currentTenant = await getCurrentTenant(mockUserId);
        if (!currentTenant) {
          setError('No active tenant found. Please contact your landlord.');
          return;
        }
        setTenant(currentTenant);

        // Load bills and payment history
        const [bills, payments] = await Promise.all([
          getPendingBills(currentTenant.id),
          getPaymentHistory(currentTenant.id)
        ]);

        setPendingBills(bills);
        setPaymentHistory(formatPaymentHistory(payments));
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mockUserId]);

  const handlePaymentClick = (bill: Billing) => {
    setSelectedBill(bill);
    setPaymentError(null);
    setShowPaymentModal(true);
  };

  const handlePhoneNumberChange = (value: string) => {
    // Remove any non-digits and format
    const digits = value.replace(/\D/g, '');
    
    // Format phone number
    if (digits.startsWith('254')) {
      setPhoneNumber(digits);
    } else if (digits.startsWith('0')) {
      setPhoneNumber('254' + digits.slice(1));
    } else if (digits.startsWith('7') || digits.startsWith('1')) {
      setPhoneNumber('254' + digits);
    } else {
      setPhoneNumber(digits);
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Kenyan phone number validation
    const phoneRegex = /^254[17]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handlePayment = async () => {
    if (!selectedBill || !tenant) return;

    if (!validatePhoneNumber(phoneNumber)) {
      setPaymentError('Please enter a valid Kenyan phone number (e.g., 254712345678)');
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const paymentRequest: PaymentRequest = {
        tenant_id: tenant.id,
        billing_id: selectedBill.id,
        amount: selectedBill.total_amount || 0,
        phone_number: phoneNumber,
        account_reference: `${tenant.property?.name}-${tenant.unit_number}`,
        transaction_desc: `Water bill payment for ${formatDate(selectedBill.billing_period_start)} - ${formatDate(selectedBill.billing_period_end)}`
      };

      const response = await initiatePayment(paymentRequest);
      setPaymentSuccess(response);
      setShowPaymentModal(false);

      // Reload data to reflect changes
      const [bills, payments] = await Promise.all([
        getPendingBills(tenant.id),
        getPaymentHistory(tenant.id)
      ]);
      setPendingBills(bills);
      setPaymentHistory(formatPaymentHistory(payments));

    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Droplet className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold ml-2">Bills & Payments</h1>
      </div>

      {/* Tenant Info */}
      {tenant && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900">
            {tenant.property?.name} - Unit {tenant.unit_number}
          </h2>
          <p className="text-sm text-blue-600">{tenant.property?.address}</p>
        </div>
      )}

      {/* Payment Success Alert */}
      {paymentSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-green-800">Payment Initiated Successfully!</h3>
          </div>
          <p className="text-green-700 mt-2">
            {paymentSuccess.customer_message}
          </p>
          <p className="text-sm text-green-600 mt-1">
            Check your phone for the M-Pesa prompt. Payment ID: {paymentSuccess.payment_id}
          </p>
          <button 
            onClick={() => setPaymentSuccess(null)}
            className="mt-3 text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('bills')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'bills'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending Bills ({pendingBills.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Payment History ({paymentHistory.length})
        </button>
      </div>

      {/* Pending Bills Tab */}
      {activeTab === 'bills' && (
        <div>
          {pendingBills.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">All Caught Up!</h3>
              <p className="text-green-600">You have no pending bills at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBills.map((bill) => (
                <div key={bill.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Water Bill</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
                      </p>
                      {bill.due_date && (
                        <p className="text-sm text-red-600">
                          Due: {formatDate(bill.due_date)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(bill.total_amount || 0)}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </div>

                  {/* Bill Details */}
                  <div className="bg-gray-50 rounded-md p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Water Consumption:</span>
                        <span className="ml-2 font-medium">
                          {bill.water_consumption ? `${bill.water_consumption} L` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Rate per Unit:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(bill.rate_per_unit)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Water Charges:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(bill.water_charges || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Service Charges:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(bill.service_charges)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePaymentClick(bill)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay with M-Pesa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'history' && (
        <div>
          {paymentHistory.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payment History</h3>
              <p className="text-gray-600">Your payment history will appear here once you make payments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {getStatusIcon(payment.status)}
                        <h3 className="font-semibold text-gray-900 ml-2">Water Bill Payment</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        {formatDate(payment.date)}
                      </p>
                      {payment.bill_period && (
                        <p className="text-sm text-gray-500 mb-1">
                          Period: {payment.bill_period}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Ref: {payment.reference}
                      </p>
                      {payment.mpesa_transaction_id && (
                        <p className="text-sm text-gray-500">
                          M-Pesa ID: {payment.mpesa_transaction_id}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {formatCurrency(payment.amount)}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">M-Pesa Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Bill Summary */}
            <div className="bg-gray-50 rounded-md p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Bill Details</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Period:</span>
                  <span>
                    {formatDate(selectedBill.billing_period_start)} - {formatDate(selectedBill.billing_period_end)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedBill.total_amount || 0)}</span>
                </div>
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => handlePhoneNumberChange(e.target.value)}
                placeholder="254712345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your M-Pesa registered phone number
              </p>
            </div>

            {paymentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{paymentError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={paymentLoading}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={paymentLoading || !phoneNumber}
                className={`flex-1 py-2 px-4 rounded-md text-white flex items-center justify-center ${
                  paymentLoading || !phoneNumber
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {paymentLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}