import { useState, useEffect } from 'react';
import { Droplet, FileText, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { 
  getTenantBills, 
  getCurrentTenant, 
  formatCurrency,
  formatDate
} from '../lib/api';
import type { Billing, Tenant } from '../lib/types';

export default function Bills() {
  const [bills, setBills] = useState<Billing[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

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

        // Load bills
        const billsData = await getTenantBills(currentTenant.id);
        setBills(billsData);
      } catch (err) {
        console.error('Error loading bills:', err);
        setError('Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mockUserId]);

  const filteredBills = bills.filter(bill => {
    if (filter === 'all') return true;
    if (filter === 'pending') return bill.status === 'pending';
    if (filter === 'paid') return bill.status === 'paid';
    if (filter === 'overdue') {
      return bill.status === 'pending' && bill.due_date && new Date(bill.due_date) < new Date();
    }
    return true;
  });

  const getStatusIcon = (status: string, dueDate?: string) => {
    if (status === 'paid') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (status === 'pending' && dueDate && new Date(dueDate) < new Date()) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (status === 'pending') {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-500" />;
  };

  const getStatusClass = (status: string, dueDate?: string) => {
    if (status === 'paid') {
      return 'bg-green-100 text-green-800';
    }
    if (status === 'pending' && dueDate && new Date(dueDate) < new Date()) {
      return 'bg-red-100 text-red-800';
    }
    if (status === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, dueDate?: string) => {
    if (status === 'paid') {
      return 'Paid';
    }
    if (status === 'pending' && dueDate && new Date(dueDate) < new Date()) {
      return 'Overdue';
    }
    if (status === 'pending') {
      return 'Pending';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const stats = {
    total: bills.length,
    pending: bills.filter(b => b.status === 'pending').length,
    paid: bills.filter(b => b.status === 'paid').length,
    overdue: bills.filter(b => 
      b.status === 'pending' && b.due_date && new Date(b.due_date) < new Date()
    ).length
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
        <FileText className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold ml-2">Billing History</h1>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm mb-1">Total Bills</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm mb-1">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm mb-1">Paid</h3>
          <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm mb-1">Overdue</h3>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All Bills', count: stats.total },
          { key: 'pending', label: 'Pending', count: stats.pending },
          { key: 'paid', label: 'Paid', count: stats.paid },
          { key: 'overdue', label: 'Overdue', count: stats.overdue }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === tab.key
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bills Found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No bills have been generated yet.'
              : `No ${filter} bills found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <div key={bill.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(bill.status, bill.due_date)}
                  <div>
                    <h3 className="font-semibold text-gray-900">Water Bill</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
                      </span>
                      {bill.due_date && (
                        <span>Due: {formatDate(bill.due_date)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(bill.total_amount || 0)}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(bill.status, bill.due_date)}`}>
                    {getStatusText(bill.status, bill.due_date)}
                  </span>
                </div>
              </div>

              {/* Bill Details */}
              <div className="bg-gray-50 rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-3">Bill Breakdown</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Water Consumption:</span>
                    <span className="font-medium">
                      {bill.water_consumption ? `${bill.water_consumption} L` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rate per Unit:</span>
                    <span className="font-medium">{formatCurrency(bill.rate_per_unit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Water Charges:</span>
                    <span className="font-medium">{formatCurrency(bill.water_charges || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service Charges:</span>
                    <span className="font-medium">{formatCurrency(bill.service_charges)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(bill.total_amount || 0)}</span>
                </div>
              </div>

              {/* Payment Info */}
              {bill.status === 'paid' && bill.paid_date && (
                <div className="mt-4 flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Paid on {formatDate(bill.paid_date)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 