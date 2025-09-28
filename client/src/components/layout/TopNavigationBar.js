import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageCircle, 
  Target,
  LinkIcon,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';

const TopNavigationBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Navigation setup
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Advisor', path: '/advisor', icon: MessageCircle },
    { name: 'Betting', path: '/betting', icon: Target },
    { name: 'Integrations', path: '/integrations', icon: LinkIcon }
  ];

  const isActive = (path) => location.pathname === path;
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full border-b-2 border-black" style={{backgroundColor: '#CED697'}}>
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 text-white rounded-lg flex items-center justify-center border-2 border-black" style={{backgroundColor: '#8A9253'}}>
              <span className="font-bold text-sm font-title">I</span>
            </div>
            <span className="text-2xl font-black font-title text-black">intrst.</span>
          </Link>
          
          {/* Center - Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium font-body flex items-center space-x-2 transition-colors border-2 border-black ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}
                  style={isActive(item.path) 
                    ? {backgroundColor: '#8A9253'} 
                    : {backgroundColor: 'white'}
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Right - Controls & User */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="p-2 border-2 border-black rounded-full transition-colors text-black"
              style={{backgroundColor: 'white'}}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#8A9253';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = 'black';
              }}
            >
              <LogOut className="w-4 h-4" />
            </button>
            
            <Link 
              to="/profile" 
              className="w-8 h-8 text-white rounded-full flex items-center justify-center font-bold border-2 border-black transition-colors hover:opacity-80" 
              style={{backgroundColor: '#98B8D6'}}
            >
              {user?.firstName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigationBar;