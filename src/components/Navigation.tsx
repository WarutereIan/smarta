import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, User } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around py-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`
            }
          >
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          
          <NavLink
            to="/purchase"
            className={({ isActive }) =>
              `flex flex-col items-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`
            }
          >
            <ShoppingCart size={24} />
            <span className="text-xs mt-1">Purchase</span>
          </NavLink>
          
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`
            }
          >
            <User size={24} />
            <span className="text-xs mt-1">Profile</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}