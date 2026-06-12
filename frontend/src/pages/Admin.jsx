import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CalendarCheck, CheckCircle, IndianRupee, RefreshCw } from 'lucide-react';
import { getAdminStats } from '../services/api';

const Admin = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getAdminStats();
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const stats = data ? [
    { label: 'Total Labour', value: data.totalLabour, icon: Users, color: 'var(--teal-700)' },
    { label: 'Open Requests', value: data.openRequests, icon: FileText, color: 'var(--warning)' },
    { label: 'Active Bookings', value: data.activeBookings, icon: CalendarCheck, color: 'var(--info)' },
    { label: 'Completed', value: data.completed, icon: CheckCircle, color: 'var(--success)' },
    { label: 'Revenue', value: `₹${data.revenue}`, icon: IndianRupee, color: 'var(--orange-500)' },
  ] : [];

  if (loading) return <div className="container page-content"><div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading admin stats...</p></div></div>;

  return (
    <div className="container page-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="section-header">
          <h2 className="section-title">Admin Overview</h2>
          <button className="btn btn-ghost" onClick={fetchStats}><RefreshCw size={16} /> Refresh</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {stats.map((stat, i) => (
            <motion.div key={stat.label} className="metric-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, boxShadow: 'var(--card-shadow-hover)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <stat.icon size={18} color={stat.color} />
                <span className="metric-label">{stat.label}</span>
              </div>
              <div className="metric-value">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <h3 className="section-title" style={{ marginBottom: '1rem' }}>Recent bookings</h3>
        {data?.recentBookings?.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><p>No bookings yet.</p></div>
        ) : (
          data?.recentBookings?.map((booking, i) => (
            <motion.div key={booking._id} className="booking-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
              <div className="booking-title">{booking.category} {booking.worker?.name ? `• ${booking.worker.name}` : ''}</div>
              <div className="booking-details">
                {booking.customer?.name ? `Customer: ${booking.customer.name} • ` : ''}{booking.city}, {booking.area} •{' '}
                <span className={`badge ${booking.status === 'completed' ? 'badge-success' : booking.status === 'confirmed' ? 'badge-info' : 'badge-warning'}`}>{booking.status}</span> • ₹{booking.price}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default Admin;
