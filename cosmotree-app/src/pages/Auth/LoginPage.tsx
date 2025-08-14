import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/UI/Logo';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ① UserCredential을 직접 받는다
      const credential = await signIn(formData.email, formData.password);
      const uid = credential.uid;

      // ② Firestore에서 권한 확인
      const snap = await getDoc(doc(db, 'users', uid));
      const data = snap.data();

      if (data?.isAdmin === 1) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
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
          minHeight: '500px',
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Form Content */}
        <div className="flex flex-col items-center justify-center h-full px-6 md:px-12 lg:px-20 xl:px-30 py-8 md:py-16 lg:py-32">
          <motion.div
            className="w-full max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-4 md:mb-8">
                Welcome back
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full h-12 md:h-14 lg:h-16 px-4 bg-white border-0 rounded-xl md:rounded-2xl text-gray-500 font-semibold text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
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
                  className="w-full h-16 bg-gray-700 text-white font-bold text-xl rounded-2xl hover:bg-gray-800 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Login
                </motion.button>
              </motion.div>
            </form>

            {/* Signup Link */}
            <motion.div
              className="flex items-center justify-center gap-2 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <span className="text-black font-semibold text-base">Don't have an account?</span>
              <Link
                to="/auth/signup"
                className="text-black font-semibold text-base hover:underline"
              >
                Sign up
              </Link>
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div
              className="text-center mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Link to="/auth/forgot-password" className="text-black font-semibold text-sm hover:underline">
                Forgot password?
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
