import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Activity, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const { isSignedIn } = useUser();

  return (
    <>
      <style>{`
        .ww-navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          height: 64px;
          display: flex;
          align-items: center;
          background: rgba(8, 12, 16, 0.85);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          font-family: 'Syne', sans-serif;
        }
        .ww-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ww-nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #eef2f7;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.3px;
          transition: color .2s;
        }
        .ww-nav-brand:hover { color: #00ff88; text-decoration: none; }
        .ww-nav-brand-icon {
          width: 34px; height: 34px;
          background: rgba(0,255,136,.12);
          border: 1px solid rgba(0,255,136,.25);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          color: #00ff88;
        }
        .ww-nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ww-nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-right: 16px;
        }
        .ww-nav-link {
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #7a8fa3;
          text-decoration: none;
          transition: all .2s;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
        }
        .ww-nav-link:hover {
          color: #eef2f7;
          background: rgba(255,255,255,.05);
          text-decoration: none;
        }
        .ww-nav-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          background: #00ff88;
          color: #000 !important;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none !important;
          transition: all .2s;
          border: none;
          cursor: pointer;
        }
        .ww-nav-btn-primary:hover {
          background: #00e07a;
          box-shadow: 0 0 24px rgba(0,255,136,.3);
          transform: translateY(-1px);
          text-decoration: none;
        }
        .ww-nav-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          background: transparent;
          color: #7a8fa3 !important;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none !important;
          border: 1px solid rgba(255,255,255,.1);
          transition: all .2s;
          cursor: pointer;
        }
        .ww-nav-btn-ghost:hover {
          border-color: rgba(0,255,136,.3);
          color: #00ff88 !important;
          text-decoration: none;
        }
        .ww-nav-live {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: rgba(0,255,136,.08);
          border: 1px solid rgba(0,255,136,.2);
          border-radius: 20px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: #00ff88;
          letter-spacing: .5px;
          margin-right: 8px;
        }
        .ww-nav-live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00ff88;
          animation: navpulse 2s ease-in-out infinite;
        }
        @keyframes navpulse { 0%,100%{opacity:1} 50%{opacity:.3} }

        @media (max-width: 640px) {
          .ww-nav-links { display: none; }
          .ww-nav-live { display: none; }
          .ww-nav-inner { padding: 0 16px; }
        }
      `}</style>

      <nav className="ww-navbar">
        <div className="ww-nav-inner">
          {/* Brand */}
          <Link to="/" className="ww-nav-brand">
            <div className="ww-nav-brand-icon">
              <Activity size={16} />
            </div>
            WealthWise
          </Link>

          {/* Right side */}
          <div className="ww-nav-right">
            {/* Live badge */}
            <div className="ww-nav-live">
              <span className="ww-nav-live-dot" />
              LIVE
            </div>

            {/* Nav links */}
            <div className="ww-nav-links">
              <Link to="/portfolio/learn" className="ww-nav-link">Learn</Link>
              <Link to="/portfolio/stock-analyzer" className="ww-nav-link">Markets</Link>
            </div>

            {/* Auth buttons */}
            {isSignedIn ? (
              <Link to="/portfolio" className="ww-nav-btn-primary">
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/sign-in" className="ww-nav-btn-ghost">Sign In</Link>
                <Link to="/sign-up" className="ww-nav-btn-primary">
                  Get Started <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
