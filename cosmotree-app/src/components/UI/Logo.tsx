import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img src="/images/logo.png" alt="Cosmotree Logo" className="h-10 rounded-lg" />
    </Link>
  );
};

export default Logo;
