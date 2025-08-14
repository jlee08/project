import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Logo from '../../components/UI/Logo';

const FindEmailPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [foundEmails, setFoundEmails] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setFoundEmails([]);
    setSearched(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter both first and last name.');
      return;
    }

    setIsLoading(true);
    setError('');
    setFoundEmails([]);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      // Firestore에서 이름으로 사용자 검색
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('name', '==', fullName));
      const querySnapshot = await getDocs(q);

      const emails: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email) {
          emails.push(data.email);
        }
      });

      setFoundEmails(emails);
      setSearched(true);

      if (emails.length === 0) {
        setError('No account found with this name. Please check your spelling or sign up for a new account.');
      }
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while searching. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 3) {
      return `${username[0]}***@${domain}`;
    }
    return `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}@${domain}`;
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
          minHeight: '500px',
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
                Find Your Email
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Enter your name to find the email address associated with your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* First Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First Name"
                  className="w-full h-12 md:h-14 lg:h-16 px-4 bg-white border-0 rounded-xl md:rounded-2xl text-gray-500 font-semibold text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </motion.div>

              {/* Last Name */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Last Name"
                  className="w-full h-12 md:h-14 lg:h-16 px-4 bg-white border-0 rounded-xl md:rounded-2xl text-gray-500 font-semibold text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                className="pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 bg-gray-700 text-white font-bold text-xl rounded-2xl hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? 'Searching...' : 'Find Email'}
                </motion.button>
              </motion.div>
            </form>

            {/* Results Section */}
            {searched && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {foundEmails.length > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="text-green-800 font-semibold mb-2">Found Email(s):</h3>
                    {foundEmails.map((email, index) => (
                      <div key={index} className="text-green-700 text-sm">
                        {maskEmail(email)}
                      </div>
                    ))}
                    <p className="text-green-600 text-xs mt-2">
                      Email addresses are partially hidden for security.
                    </p>
                  </div>
                ) : (
                  error && (
                    <div className="text-red-500 text-center text-sm">
                      {error}
                    </div>
                  )
                )}
              </motion.div>
            )}

            {/* Back to Login Link */}
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
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
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Link
                to="/auth/forgot-password"
                className="text-black font-semibold text-sm hover:underline"
              >
                Reset Password
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

export default FindEmailPage;
