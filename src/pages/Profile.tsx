import { User, Settings, Bell, CreditCard, LogOut, Phone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { user, signOut } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-blue-600 -mx-4 px-4 pt-12 pb-6 mb-6">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white bg-blue-500 flex items-center justify-center">
            <User className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Tenant User</h1>
          <div className="flex items-center justify-center text-blue-100 mt-2">
            <Phone className="h-4 w-4 mr-2" />
            <p>{user?.phone || 'Phone not available'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">User ID</span>
            <span className="font-medium text-sm">{user?.id?.substring(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone Number</span>
            <span className="font-medium">{user?.phone || 'Not available'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Status</span>
            <span className="font-medium text-green-600">Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Last Sign In</span>
            <span className="font-medium text-sm">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <button className="w-full bg-white p-4 rounded-lg shadow flex items-center hover:bg-gray-50 transition-colors">
          <User className="h-5 w-5 text-gray-500" />
          <span className="ml-3">Edit Profile</span>
        </button>
        <button className="w-full bg-white p-4 rounded-lg shadow flex items-center hover:bg-gray-50 transition-colors">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="ml-3">Notifications</span>
        </button>
        <button className="w-full bg-white p-4 rounded-lg shadow flex items-center hover:bg-gray-50 transition-colors">
          <CreditCard className="h-5 w-5 text-gray-500" />
          <span className="ml-3">Payment Methods</span>
        </button>
        <button className="w-full bg-white p-4 rounded-lg shadow flex items-center hover:bg-gray-50 transition-colors">
          <Settings className="h-5 w-5 text-gray-500" />
          <span className="ml-3">App Settings</span>
        </button>
      </div>

      <button
        onClick={signOut}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
      >
        <LogOut className="h-5 w-5 mr-2" />
        Sign Out
      </button>
    </div>
  );
}