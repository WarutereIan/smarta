import { supabase } from './supabase';
import type { 
  Tenant, 
  Billing, 
  Payment, 
  PaymentRequest, 
  PaymentHistory,
  TenantDashboardStats,
  MpesaPaymentResponse,
  PaymentStatusResponse,
  WaterUsageData,
  Meter
} from './types';

// Get current tenant information
export const getCurrentTenant = async (userId: string): Promise<Tenant | null> => {
  const { data, error } = await supabase
    .from('tenants')
    .select(`
      *,
      property:properties(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }
  return data;
};

// Get tenant's water meter
export const getTenantMeter = async (tenantId: string): Promise<Meter | null> => {
  const { data, error } = await supabase
    .from('meters')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('Error fetching meter:', error);
    return null;
  }
  return data;
};

// Get tenant's bills
export const getTenantBills = async (tenantId: string): Promise<Billing[]> => {
  const { data, error } = await supabase
    .from('billing')
    .select(`
      *,
      meter:meters(*)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bills:', error);
    return [];
  }
  return data || [];
};

// Get pending bills for tenant
export const getPendingBills = async (tenantId: string): Promise<Billing[]> => {
  const { data, error } = await supabase
    .from('billing')
    .select(`
      *,
      meter:meters(*)
    `)
    .eq('tenant_id', tenantId)
    .eq('status', 'pending')
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching pending bills:', error);
    return [];
  }
  return data || [];
};

// Get tenant's payment history
export const getPaymentHistory = async (tenantId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      billing:billing(
        *,
        meter:meters(*)
      )
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
  return data || [];
};

// Get tenant dashboard statistics
export const getTenantStats = async (tenantId: string): Promise<TenantDashboardStats> => {
  try {
    const [billsResult, paymentsResult, meterResult] = await Promise.all([
      supabase
        .from('billing')
        .select('total_amount, status, water_consumption')
        .eq('tenant_id', tenantId),
      supabase
        .from('payments')
        .select('amount, payment_date, payment_status')
        .eq('tenant_id', tenantId)
        .eq('payment_status', 'completed'),
      supabase
        .from('meters')
        .select('last_reading_value')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .single()
    ]);

    const bills = billsResult.data || [];
    const payments = paymentsResult.data || [];
    const meter = meterResult.data;

    const pendingBills = bills.filter(b => b.status === 'pending');
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const monthlyUsage = bills
      .filter(b => b.status === 'paid' || b.status === 'pending')
      .reduce((sum, b) => sum + (b.water_consumption || 0), 0);

    const lastPayment = payments.sort((a, b) => 
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    )[0];

    return {
      currentBalance: meter?.last_reading_value || 0,
      monthlyUsage,
      dailyAverage: monthlyUsage / 30,
      pendingBills: pendingBills.length,
      totalPaid,
      lastPaymentDate: lastPayment?.payment_date
    };
  } catch (error) {
    console.error('Error fetching tenant stats:', error);
    return {
      currentBalance: 0,
      monthlyUsage: 0,
      dailyAverage: 0,
      pendingBills: 0,
      totalPaid: 0
    };
  }
};

// Get water usage data for charts
export const getWaterUsageData = async (tenantId: string, timeframe: 'weekly' | 'monthly'): Promise<WaterUsageData> => {
  try {
    const { data, error } = await supabase
      .from('meter_readings')
      .select(`
        reading_value,
        reading_date,
        consumption,
        meter:meters!inner(tenant_id)
      `)
      .eq('meter.tenant_id', tenantId)
      .order('reading_date', { ascending: true })
      .limit(timeframe === 'weekly' ? 7 : 30);

    if (error) throw error;

    const readings = data || [];
    
    if (timeframe === 'weekly') {
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const usage = new Array(7).fill(0);
      
      readings.forEach(reading => {
        const date = new Date(reading.reading_date);
        const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
        usage[dayIndex] = reading.consumption || 0;
      });
      
      return { labels, usage };
    } else {
      // Monthly data - group by weeks
      const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const usage = new Array(4).fill(0);
      
      readings.forEach(reading => {
        const date = new Date(reading.reading_date);
        const dayOfMonth = date.getDate();
        const weekIndex = Math.floor((dayOfMonth - 1) / 7);
        if (weekIndex < 4) {
          usage[weekIndex] += reading.consumption || 0;
        }
      });
      
      return { labels, usage };
    }
  } catch (error) {
    console.error('Error fetching water usage data:', error);
    return {
      labels: timeframe === 'weekly' ? 
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] : 
        ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      usage: new Array(timeframe === 'weekly' ? 7 : 4).fill(0)
    };
  }
};

// Initiate M-Pesa payment
export const initiatePayment = async (paymentRequest: PaymentRequest): Promise<MpesaPaymentResponse> => {
  const { data, error } = await supabase.functions.invoke('mpesa-payment/initiate', {
    body: paymentRequest
  });

  if (error) {
    throw new Error(`Payment initiation failed: ${error.message}`);
  }

  if (!data.success) {
    throw new Error(`Payment failed: ${data.error || 'Unknown error'}`);
  }

  return data;
};

// Check payment status
export const checkPaymentStatus = async (paymentId: string): Promise<PaymentStatusResponse> => {
  const { data, error } = await supabase.functions.invoke('mpesa-payment/status', {
    body: { payment_id: paymentId }
  });

  if (error) {
    throw new Error(`Failed to check payment status: ${error.message}`);
  }

  return data;
};

// Format payment history for display
export const formatPaymentHistory = (payments: Payment[]): PaymentHistory[] => {
  return payments.map(payment => ({
    id: payment.id,
    amount: payment.amount,
    status: payment.payment_status,
    date: payment.payment_date,
    reference: payment.payment_reference,
    mpesa_transaction_id: payment.mpesa_transaction_id,
    bill_period: payment.billing ? 
      `${new Date(payment.billing.billing_period_start).toLocaleDateString()} - ${new Date(payment.billing.billing_period_end).toLocaleDateString()}` : 
      undefined
  }));
};

// Get overdue bills count
export const getOverdueBillsCount = async (tenantId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('billing')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('status', 'pending')
    .lt('due_date', new Date().toISOString());

  if (error) {
    console.error('Error fetching overdue bills:', error);
    return 0;
  }

  return data?.length || 0;
};

// Utility function to format currency
export const formatCurrency = (amount: number): string => {
  return `KSh ${amount.toLocaleString()}`;
};

// Utility function to format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}; 