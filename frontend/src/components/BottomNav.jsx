import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Send, CalendarDays, ClipboardList, User, ShoppingCart, MessageSquare } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/bookings', icon: CalendarDays, label: 'Bookings' },
    { to: '/my-posts', icon: ClipboardList, label: 'My Posts' },
    { to: '/cart', icon: ShoppingCart, label: 'My Cart' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <Link
          key={item.to}
          to={item.to}
          className={`bottom-nav-item ${path === item.to ? 'active' : ''} ${item.isPost ? 'post-btn' : ''}`}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
