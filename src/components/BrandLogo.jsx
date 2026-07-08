import { Link } from 'react-router-dom';
import logo from '../assets/adama-logo.png';
// comments
export default function BrandLogo({ className = '', showText = true, to = '/' }) {
  return (
    <Link to={to} className={`brand-logo ${className}`}>
      <img src={logo} alt="Adama City Administration" className="brand-logo-img" />
      {showText && (
        <span className="brand-logo-text">
          <strong>Adama City</strong>
          <small>CITIZEN PORTAL</small>
        </span>
      )}
    </Link>
  );
}
