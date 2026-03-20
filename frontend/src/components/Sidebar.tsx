import { Link, useLocation } from 'react-router-dom';
import {
  BarChart2, BookOpen, TrendingUp, User, LineChart,
  LayoutDashboard, Database, MessageSquare, Newspaper,
  Calculator, HelpCircle, Activity, ChevronRight
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useTour } from '../context/TourContext';

const menuItems = [
  { path: '/portfolio',                    icon: LayoutDashboard, label: 'Portfolio',         tourClass: 'tour-portfolio',      color: '#00ff88' },
  { path: '/portfolio/my-data',            icon: Database,        label: 'My Data',            tourClass: 'tour-my-data',        color: '#4d9fff' },
  { path: '/portfolio/recommendations',    icon: TrendingUp,      label: 'Recommendations',    tourClass: 'tour-recommendations', color: '#f5c842' },
  { path: '/portfolio/learn',              icon: BookOpen,        label: 'Money Matters',      tourClass: 'tour-learn',          color: '#a78bfa' },
  { path: '/portfolio/financial-path',     icon: BarChart2,       label: 'Financial Path',     tourClass: 'tour-financial-path', color: '#00ff88' },
  { path: '/portfolio/money-calc',         icon: Calculator,      label: 'Money Calculator',   tourClass: 'tour-money-calc',     color: '#4d9fff' },
  { path: '/portfolio/chatbot',            icon: MessageSquare,   label: 'AI Assistant',       tourClass: 'tour-ai-assistant',   color: '#00ff88' },
  { path: '/portfolio/money-pulse',        icon: Newspaper,       label: 'Money Pulse',        tourClass: 'tour-money-pulse',    color: '#f5c842' },
  { path: '/portfolio/stock-analyzer',     icon: LineChart,       label: 'Stock Analyzer',     tourClass: 'tour-stock-analyzer', color: '#a78bfa' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useUser();
  const { openTour } = useTour();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        .ww-sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: 240px;
          background: #0a0e13;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex;
          flex-direction: column;
          z-index: 50;
          font-family: 'Syne', sans-serif;
          overflow: hidden;
        }

        /* ── Logo ── */
        .ww-sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,.06);
          text-decoration: none;
          color: #eef2f7;
          transition: color .2s;
        }
        .ww-sb-logo:hover { color: #00ff88; text-decoration: none; }
        .ww-sb-logo-icon {
          width: 36px; height: 36px;
          background: rgba(0,255,136,.1);
          border: 1px solid rgba(0,255,136,.25);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #00ff88;
          flex-shrink: 0;
        }
        .ww-sb-logo-name {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }
        .ww-sb-logo-tag {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: #3d5166;
          letter-spacing: .8px;
          text-transform: uppercase;
          margin-top: 1px;
        }

        /* ── Nav ── */
        .ww-sb-nav {
          flex: 1;
          padding: 14px 10px;
          overflow-y: auto;
        }
        .ww-sb-nav::-webkit-scrollbar { width: 3px; }
        .ww-sb-nav::-webkit-scrollbar-track { background: transparent; }
        .ww-sb-nav::-webkit-scrollbar-thumb { background: #1e2a35; border-radius: 2px; }

        .ww-sb-section-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #2a3a4a;
          padding: 6px 8px 8px;
          margin-top: 4px;
        }

        .ww-sb-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 10px;
          color: #5a7080;
          text-decoration: none !important;
          font-size: 13px;
          font-weight: 500;
          transition: all .18s;
          margin-bottom: 2px;
          border: 1px solid transparent;
          position: relative;
        }
        .ww-sb-item:hover {
          background: rgba(255,255,255,.04);
          color: #c0d0dc;
          text-decoration: none;
        }
        .ww-sb-item.active {
          background: rgba(0,255,136,.08);
          color: #00ff88;
          border-color: rgba(0,255,136,.2);
        }
        .ww-sb-item-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,.04);
          transition: background .18s;
        }
        .ww-sb-item.active .ww-sb-item-icon {
          background: rgba(0,255,136,.12);
        }
        .ww-sb-item-label { flex: 1; }
        .ww-sb-item-arrow {
          opacity: 0;
          transition: opacity .18s;
          color: #00ff88;
        }
        .ww-sb-item.active .ww-sb-item-arrow { opacity: 1; }
        .ww-sb-item:hover .ww-sb-item-arrow { opacity: .5; }

        /* ── Profile ── */
        .ww-sb-bottom {
          padding: 10px;
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .ww-sb-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 10px;
          text-decoration: none !important;
          color: #eef2f7;
          transition: background .18s;
          margin-bottom: 8px;
        }
        .ww-sb-profile:hover { background: rgba(255,255,255,.05); text-decoration: none; }
        .ww-sb-avatar {
          width: 36px; height: 36px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid rgba(0,255,136,.2);
          flex-shrink: 0;
        }
        .ww-sb-avatar-placeholder {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(0,255,136,.1);
          border: 1px solid rgba(0,255,136,.2);
          display: flex; align-items: center; justify-content: center;
          color: #00ff88;
          flex-shrink: 0;
        }
        .ww-sb-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #eef2f7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }
        .ww-sb-user-email {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #3d5166;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
          margin-top: 1px;
        }

        /* ── Tour button ── */
        .ww-sb-tour-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 9px;
          border-radius: 10px;
          background: rgba(77,159,255,.08);
          border: 1px solid rgba(77,159,255,.2);
          color: #4d9fff;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all .18s;
        }
        .ww-sb-tour-btn:hover {
          background: rgba(77,159,255,.15);
          box-shadow: 0 0 16px rgba(77,159,255,.15);
        }
      `}</style>

      <aside className="ww-sidebar">
        {/* Logo */}
        <Link to="/" className="ww-sb-logo">
          <div className="ww-sb-logo-icon">
            <Activity size={18} />
          </div>
          <div>
            <div className="ww-sb-logo-name">WealthWise</div>
            <div className="ww-sb-logo-tag">AI Finance Advisor</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="ww-sb-nav">
          <div className="ww-sb-section-label">Navigation</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`ww-sb-item ${item.tourClass} ${isActive ? 'active' : ''}`}
              >
                <div
                  className="ww-sb-item-icon"
                  style={isActive ? { color: item.color } : { color: '#5a7080' }}
                >
                  <Icon size={15} />
                </div>
                <span className="ww-sb-item-label">{item.label}</span>
                <ChevronRight size={13} className="ww-sb-item-arrow" />
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="ww-sb-bottom">
          <Link to="/portfolio/profile" className="ww-sb-profile tour-profile">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="ww-sb-avatar" />
            ) : (
              <div className="ww-sb-avatar-placeholder">
                <User size={16} />
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div className="ww-sb-user-name">{user?.fullName || 'User Name'}</div>
              <div className="ww-sb-user-email">
                {user?.primaryEmailAddress?.emailAddress || 'email@example.com'}
              </div>
            </div>
          </Link>

          <button onClick={openTour} className="ww-sb-tour-btn">
            <HelpCircle size={13} />
            Take a Tour
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
