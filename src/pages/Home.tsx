import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Droplet, Activity, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { 
  getTenantStats, 
  getWaterUsageData, 
  getPendingBills, 
  getCurrentTenant, 
  getTenantMeter,
  formatCurrency,
  formatDate 
} from '../lib/api';
import type { TenantDashboardStats, WaterUsageData, Billing, Tenant, Meter } from '../lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [stats, setStats] = useState<TenantDashboardStats | null>(null);
  const [usageData, setUsageData] = useState<WaterUsageData | null>(null);
  const [pendingBills, setPendingBills] = useState<Billing[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [meter, setMeter] = useState<Meter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Get tenant's meter
        const tenantMeter = await getTenantMeter(currentTenant.id);
        setMeter(tenantMeter);

        // Load all data in parallel
        const [statsData, usageChartData, bills] = await Promise.all([
          getTenantStats(currentTenant.id),
          getWaterUsageData(currentTenant.id, timeframe),
          getPendingBills(currentTenant.id)
        ]);

        setStats(statsData);
        setUsageData(usageChartData);
        setPendingBills(bills);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mockUserId, timeframe]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Liters'
        }
      }
    }
  };

  const chartData = usageData ? {
    labels: usageData.labels,
    datasets: [
      {
        label: 'Usage (Liters)',
        data: usageData.usage,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Droplet className="h-6 w-6 text-blue-500" />
          <h1 className="text-2xl font-bold ml-2">Smarta</h1>
        </div>
        <div className="flex items-center gap-2">
          <Activity className={`h-5 w-5 ${meter?.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm font-medium ${meter?.status === 'active' ? 'text-green-700' : 'text-red-700'}`}>
            Meter {meter?.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Tenant Info */}
      {tenant && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-blue-900">Welcome back!</h2>
          <p className="text-blue-700">
            {tenant.property?.name} - Unit {tenant.unit_number}
          </p>
          <p className="text-sm text-blue-600">{tenant.property?.address}</p>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm mb-2">Current Balance</h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.currentBalance ? `${stats.currentBalance.toLocaleString()} L` : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm mb-2">Pending Bills</h3>
          <div className="flex items-center">
            <p className="text-3xl font-bold text-red-600">{stats?.pendingBills || 0}</p>
            {(stats?.pendingBills || 0) > 0 && (
              <CreditCard className="h-6 w-6 text-red-500 ml-2" />
            )}
          </div>
        </div>
      </div>

      {/* Pending Bills Alert */}
      {pendingBills.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-800">Outstanding Bills</h3>
          </div>
          <div className="mt-2 space-y-2">
            {pendingBills.slice(0, 2).map((bill) => (
              <div key={bill.id} className="flex justify-between items-center">
                <span className="text-yellow-700">
                  {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
                </span>
                <span className="font-semibold text-yellow-800">
                  {formatCurrency(bill.total_amount || 0)}
                </span>
              </div>
            ))}
            {pendingBills.length > 2 && (
              <p className="text-sm text-yellow-600">
                +{pendingBills.length - 2} more bills
              </p>
            )}
          </div>
          <button className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm font-medium">
            View All Bills
          </button>
        </div>
      )}

      {/* Water Usage Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Water Usage</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeframe === 'weekly'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 rounded-md text-sm ${
                timeframe === 'monthly'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
        {chartData ? (
          <Line options={chartOptions} data={chartData} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No usage data available
          </div>
        )}
      </div>

      {/* Usage Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm mb-2">Daily Average</h3>
          <p className="text-xl font-semibold text-gray-900">
            {stats?.dailyAverage ? `${Math.round(stats.dailyAverage)} L` : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm mb-2">Monthly Usage</h3>
          <p className="text-xl font-semibold text-gray-900">
            {stats?.monthlyUsage ? `${Math.round(stats.monthlyUsage)} L` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Payment Summary */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-gray-600 text-sm mb-2">Total Paid</h4>
              <p className="text-xl font-semibold text-green-600">
                {formatCurrency(stats.totalPaid)}
              </p>
            </div>
            <div>
              <h4 className="text-gray-600 text-sm mb-2">Last Payment</h4>
              <p className="text-sm text-gray-700">
                {stats.lastPaymentDate ? formatDate(stats.lastPaymentDate) : 'No payments yet'}
              </p>
            </div>
          </div>
          
          {stats.pendingBills === 0 && (
            <div className="mt-4 flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">All bills are up to date!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}