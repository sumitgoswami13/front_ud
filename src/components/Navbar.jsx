import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">📄</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">UDIN</span>
            </div>
          </div>
          
{/*           <div className="flex items-center space-x-3">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Signup
            </button>
            <a
              href="/admin/login"
              className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
            >
              Admin
            </a>
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
