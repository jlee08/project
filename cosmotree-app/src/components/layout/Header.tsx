import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../UI/Logo';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  mode?: 'light' | 'dark';
  fixed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ mode = 'light', fixed = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  console.log('user in Header:', user, 'isAdmin:', isAdmin);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const NavLink = ({
    to,
    children,
    onClick,
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 hover:bg-opacity-10 hover:bg-gray-500 rounded-lg transition-colors"
      onClick={() => {
        setIsMenuOpen(false);
        if (onClick) onClick();
      }}
    >
      <span
        className={`text-lg font-gowun leading-tight tracking-tight ${
          mode === 'light' ? 'text-black' : 'text-white'
        }`}
      >
        {children}
      </span>
    </Link>
  );

  // Admin Header
  if (isAdmin) {
    return (
      <>
        <nav
          className={`${fixed ? 'fixed' : ''} top-4 md:top-10 left-4 md:left-10 right-4 md:right-10 z-50 backdrop-blur rounded-xl ${
            mode === 'light'
              ? 'bg-gray-200 bg-opacity-50'
              : 'bg-black bg-opacity-50 backdrop-blur-lg'
          }`}
        >
          <div className="flex justify-between items-center py-3 md:py-5 px-4 max-w-7xl">
            <Logo />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {/* 공통 링크들 */}
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/learn">Learn</NavLink>
              <NavLink to="/quizzes">Quizzes</NavLink>
              <NavLink to="/challenges">Challenges</NavLink>

              {/* 로그인 전 */}
              {!user && (
                <>
                  <NavLink to="/auth/login">Login</NavLink>
                  <NavLink to="/auth/signup">Sign Up</NavLink>
                </>
              )}

              {/* 로그인 후 */}
              {user && (
                <>
                  {/* Admin은 Admin과 My Page 둘 다 보여주기 */}
                  {isAdmin && <NavLink to="/admin">Admin</NavLink>}
                  <NavLink to="/mypage">My Page</NavLink>
                  <NavLink onClick={signOut} to={'/'}>
                    Sign Out
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-700" />
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-gray-700"
                >
                  <path
                    d="M3 12H21M3 6H21M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Offcanvas */}
        {isMenuOpen && (
            <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <div
              className={`
              fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50 lg:hidden
              transform transition-transform duration-300
              ${mode === 'light'
                ? 'bg-white border-l border-gray-200'
                : 'bg-gray-900 border-l border-gray-700'}
              `}
            >
              <div className="flex flex-col h-full">
              {/* Offcanvas Header */}
              <div className={`flex justify-between items-center p-4 border-b ${mode === 'light' ? 'border-gray-200' : 'border-gray-700'}`}>
                <Logo />
                <button
                onClick={() => setIsMenuOpen(false)}
                className={`p-2 rounded-lg ${mode === 'light' ? 'hover:bg-gray-100' : 'hover:bg-gray-800'} transition-colors`}
                >
                <XMarkIcon className={`w-6 h-6 ${mode === 'light' ? 'text-black' : 'text-white'}`} />
                </button>
              </div>

              {/* Offcanvas Links */}
              <div className="flex flex-col p-4 space-y-2">
                {/* 공통 링크들 */}
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/learn">Learn</NavLink>
                <NavLink to="/quizzes">Quizzes</NavLink>
                <NavLink to="/challenges">Challenges</NavLink>
                <div className={`border-t pt-4 mt-4 ${mode === 'light' ? 'border-gray-200' : 'border-gray-700'}`}></div>
                {/* 로그인 전 */}
                {!user && (
                <>
                  <NavLink to="/auth/login">Login</NavLink>
                  <NavLink to="/auth/signup">Sign Up</NavLink>
                </>
                )}

                {/* 로그인 후 */}
                {user && (
                <>
                  {/* Admin은 Admin과 My Page 둘 다 보여주기 */}
                  {isAdmin && <NavLink to="/admin">Admin</NavLink>}
                  <NavLink to="/mypage">My Page</NavLink>
                  <NavLink onClick={signOut} to={'/'}>
                  Sign Out
                  </NavLink>
                </>
                )}
              </div>
              </div>
            </div>
            </>
        )}
      </>
    );
  }

  // Regular Header
  return (
    <>
      <nav
        className={`${fixed ? 'fixed' : ''} top-4 md:top-10 left-4 md:left-10 right-4 md:right-10 z-50 backdrop-blur rounded-xl ${
          mode === 'light' ? 'bg-gray-200 bg-opacity-50' : 'bg-black bg-opacity-50 backdrop-blur-lg'
        }`}
      >
        <div className="flex justify-between items-center py-3 md:py-5 px-4 max-w-7xl mx-auto">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {/* 공통 링크들 */}
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/learn">Learn</NavLink>
            <NavLink to="/quizzes">Quizzes</NavLink>
            <NavLink to="/challenges">Challenges</NavLink>

            {/* 로그인 전 */}
            {!user && (
              <>
                <NavLink to="/auth/login">Login</NavLink>
                <NavLink to="/auth/signup">Sign Up</NavLink>
              </>
            )}

            {/* 로그인 후 */}
            {user && (
              <>
                {/* Admin은 Admin과 My Page 둘 다 보여주기 */}
                {isAdmin && <NavLink to="/admin">Admin</NavLink>}
                <NavLink to="/mypage">My Page</NavLink>
                <NavLink onClick={signOut} to={'/'}>
                  Sign Out
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className={mode === 'light' ? 'text-black' : 'text-white'}
            >
              {isMenuOpen ? (
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M3 12H21M3 6H21M3 18H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Offcanvas Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50 lg:hidden transform transition-transform duration-300 ${
              mode === 'light'
                ? 'bg-white border-l border-gray-200'
                : 'bg-gray-900 border-l border-gray-700'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <Logo />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={mode === 'light' ? 'text-black' : 'text-white'}
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col p-4 space-y-2">
                {/* 공통 링크들 */}
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/learn">Learn</NavLink>
                <NavLink to="/quizzes">Quizzes</NavLink>
                <NavLink to="/challenges">Challenges</NavLink>
                <div className="border-t border-gray-200 pt-4 mt-4"></div>
                {/* 로그인 전 */}
                {!user && (
                  <>
                    <NavLink to="/auth/login">Login</NavLink>
                    <NavLink to="/auth/signup">Sign Up</NavLink>
                  </>
                )}

                {/* 로그인 후 */}
                {user && (
                  <>
                    {/* Admin은 Admin과 My Page 둘 다 보여주기 */}
                    {isAdmin && <NavLink to="/admin">Admin</NavLink>}
                    <NavLink to="/mypage">My Page</NavLink>
                    <NavLink onClick={signOut} to={'/'}>
                      Sign Out
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
