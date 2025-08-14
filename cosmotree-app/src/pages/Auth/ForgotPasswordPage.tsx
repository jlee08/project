import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import Logo from '../../components/UI/Logo';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('/images/main-sec.png')`,
      }}
    >
      {/* Logo positioned top-left */}
      <div className="absolute top-4 md:top-8 left-4 md:left-5">
        <Logo />
      </div>

      {/* Main Form Container */}
      <motion.div
        className="bg-white bg-opacity-50 backdrop-blur-xl border border-gray-400 rounded-2xl md:rounded-3xl p-0 w-full max-w-md md:max-w-lg lg:max-w-2xl"
        style={{
          height: 'auto',
          minHeight: '450px',
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Form Content */}
        <div className="flex flex-col items-center justify-center h-full px-6 md:px-12 lg:px-20 xl:px-30 py-8 md:py-16 lg:py-24">
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4">
                Reset Password
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full h-12 md:h-14 lg:h-16 px-4 bg-white border-0 rounded-xl md:rounded-2xl text-gray-500 font-semibold text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-center text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Success Message */}
              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-600 text-center text-sm"
                >
                  {message}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                className="pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 bg-gray-700 text-white font-bold text-xl rounded-2xl hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </motion.button>
              </motion.div>
            </form>

            {/* Back to Login Link */}
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link
                to="/auth/login"
                className="text-black font-semibold text-base hover:underline"
              >
                ← Back to Login
              </Link>
            </motion.div>

            {/* Additional Links */}
            <motion.div
              className="flex items-center justify-center gap-4 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Link
                to="/auth/find-email"
                className="text-black font-semibold text-sm hover:underline"
              >
                Find Email
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/auth/signup"
                className="text-black font-semibold text-sm hover:underline"
              >
                Sign up
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
