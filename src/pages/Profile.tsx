import { User, Settings, Bell, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Profile() {
  const { signOut } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-blue-600 -mx-4 px-4 pt-12 pb-6 mb-6">
        <div className="text-center">
          <img
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400"
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white"
          />
          <h1 className="text-2xl font-bold text-white">John Doe</h1>
          <p className="text-blue-100">john.doe@example.com</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Meter ID</span>
            <span className="font-medium">SMT-2023-001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Customer ID</span>
            <span className="font-medium">CUS-1234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location</span>
            <span className="font-medium">Nairobi, Kenya</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <button className="w-full bg-white p-4 rounded-lg shadow flex items-center">
          <User className="h-5 w-5 text-gray-500" />
          <span className="ml-3">Edit Profile</span>
        </button>
        <button className="w-full bg-white p-4 rounded-lg shadow flex items-center">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="ml-3">Notifications</span>
        </button>
        <button className="w-full bg-white p-4 rounded-lg shadow flex items-center">
          <CreditCard className="h-5 w-5 text-gray-500" />
          <span className="ml-3">Payment Methods</span>
        </button>
        <button className="w-full bg-white p-4 rounded-lg shadow flex items-center">
          <Settings className="h-5 w-5 text-gray-500" />
          <span className="ml-3">App Settings</span>
        </button>
      </div>

      <button
        onClick={signOut}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700"
      >
        Log Out
      </button>
    </div>
  );
}