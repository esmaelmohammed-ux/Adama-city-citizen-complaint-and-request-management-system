import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import '../components/BrandLogo.css';
import './Landing.css';

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <BrandLogo className="landing-brand-logo" to="/" />
        <div className="landing-actions">
          <Link to="/login" className="btn btn-ghost">Sign in</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">Citizen Service Portal</p>
          <h1>Report issues. Request services. Track progress.</h1>
          <p className="hero-text">
            Submit complaints and service requests online, follow their status in real time,
            and connect with Adama City Administration departments from one place.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
            <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
          </div>
        </div>
        <div className="hero-cards">
          <div className="feature-card">
            <span>📝</span>
            <h3>Submit Online</h3>
            <p>File complaints and service requests without visiting offices.</p>
          </div>
          <div className="feature-card">
            <span>🔍</span>
            <h3>Track Status</h3>
            <p>Follow every update from submission to resolution.</p>
          </div>
          <div className="feature-card">
            <span>🏛️</span>
            <h3>Department Routing</h3>
            <p>Requests are assigned to the right municipal department.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
