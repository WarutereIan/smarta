import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 py-6">
            <Outlet />
          </main>
          <Navigation />
        </div>
      </div>
    </div>
  );
}