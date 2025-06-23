// Tenant-side type definitions for payment integration

export interface Tenant {
  id: string;
  property_id: string;
  user_id?: string;
  unit_number: string;
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface Property {
  id: string;
  landlord_id?: string;
  name: string;
  address: string;
  property_type: 'residential' | 'commercial' | 'mixed';
  total_units: number;
  created_at: string;
  updated_at: string;
}

export interface Meter {
  id: string;
  property_id: string;
  tenant_id?: string;
  meter_number: string;
  meter_type: 'water' | 'electricity' | 'gas';
  location: string;
  installation_date: string;
  last_reading_date?: string;
  last_reading_value?: number;
  status: 'active' | 'inactive' | 'maintenance' | 'available';
  created_at: string;
  updated_at: string;
}

export interface Billing {
  id: string;
  tenant_id: string;
  meter_id: string;
  billing_period_start: string;
  billing_period_end: string;
  water_consumption?: number;
  rate_per_unit: number;
  water_charges?: number;
  service_charges: number;
  total_amount?: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date?: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
  meter?: Meter;
}

export interface Payment {
  id: string;
  billing_id: string;
  tenant_id: string;
  amount: number;
  payment_method: 'mpesa' | 'bank_transfer' | 'cash';
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_reference: string;
  mpesa_transaction_id?: string;
  payment_date: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
  billing?: Billing;
}

export interface PaymentRequest {
  tenant_id: string;
  billing_id: string;
  amount: number;
  phone_number: string;
  account_reference: string;
  transaction_desc: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string;
  reference: string;
  mpesa_transaction_id?: string;
  bill_period?: string;
}

export interface TenantDashboardStats {
  currentBalance: number;
  monthlyUsage: number;
  dailyAverage: number;
  pendingBills: number;
  totalPaid: number;
  lastPaymentDate?: string;
}

export interface WaterUsageData {
  labels: string[];
  usage: number[];
}

export interface MpesaPaymentResponse {
  success: boolean;
  payment_id: string;
  checkout_request_id: string;
  merchant_request_id: string;
  customer_message: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  status: string;
  amount: number;
  reference: string;
  mpesa_receipt?: string;
  confirmed_at?: string;
} 