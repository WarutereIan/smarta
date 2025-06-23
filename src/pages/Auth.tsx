import { useState } from 'react';
import { Droplet, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const isDevelopment = import.meta.env.DEV;

export default function Auth() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const { signInWithPhone, verifyOtp, loading, error } = useAuth();

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits and ensure it starts with +254
    let cleaned = value.replace(/\D/g, '');
    
    if (cleaned.startsWith('254')) {
      cleaned = '254' + cleaned.slice(3);
    } else if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return '+' + cleaned;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = formatPhoneNumber(phone);
    setPhone(formattedPhone);
    const success = await signInWithPhone(formattedPhone);
    if (success) setStep('otp');
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyOtp(phone, otp);
    if (success) {
      // Navigation will be handled automatically by the auth state change
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow user to type freely but show formatted version
    setPhone(value);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Droplet className="h-12 w-12 text-blue-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Smarta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your smart water billing companion
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {isDevelopment && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Development Mode</h3>
                <p className="mt-1 text-xs text-amber-700">
                  SMS is disabled. Use any 6-digit code to verify.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit}>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0700000000 or +254700000000"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {isDevelopment 
                    ? "Enter any Kenyan phone number for testing."
                    : "Enter your Kenyan phone number. We'll send you a verification code."
                  }
                </p>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || !phone.trim()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : isDevelopment ? 'Continue' : 'Send Verification Code'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={handleOtpChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {isDevelopment 
                    ? `Enter any 6-digit code for ${phone}`
                    : `Enter the 6-digit code sent to ${phone}`
                  }
                </p>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-500"
                >
                  Use a different phone number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}