import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const navigate = useNavigate();
  const { signUp } = useAuth();

  // 공통 onChange: 모든 input(name)→formData 동기화
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const getPasswordStrengthScore = () => Object.values(passwordStrength).filter(Boolean).length;

  const getPasswordStrengthColor = () => {
    const score = getPasswordStrengthScore();
    if (score <= 2) return 'bg-red-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };
  // formData에 있는 네 필드만 검사
  const validateForm = () => {
    const { firstName, lastName, email } = formData;

    if (!firstName || !lastName) {
      setError('Please enter both first and last name.');
      return false;
    }
    if (!email) {
      setError('Please enter your email address.');
      return false;
    }
    if (getPasswordStrengthScore() < 3) {
      setError('Please choose a stronger password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError('');
      const { firstName, lastName, email, password } = formData;
      const fullName = `${firstName} ${lastName}`.trim();

      // 1) 계정 생성
      const user = await signUp(email, password); // user: FirebaseUser

      // 2) Auth 프로필에 displayName 세팅
      // (signUp이 userCredential.user를 반환한다고 가정)
      await updateProfile(user, { displayName: fullName });

      // 필요시 이메일 인증 메일 발송
      // await sendEmailVerification(user);

      // 3) Firestore에도 별도로 저장(선택)
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: fullName,
        isAdmin: 0,
        createdAt: serverTimestamp(),
      });

      // 4) 자동 로그인 (이미 signUp이 로그인 상태라면 생략 가능)
      await signInWithEmailAndPassword(auth, email, password);

      // (옵션) 새로고침 없이 최신 프로필을 확실히 쓰고 싶으면:
      // await auth.currentUser?.reload();

      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: `url('/images/main-sec.png')` }}
    >
      {/* Logo positioned top-left */}
      <div className="absolute top-4 md:top-8 left-4 md:left-5">
        <Link to="/" className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Cosmotree Logo" className="h-8 md:h-10 rounded-lg" />
        </Link>
      </div>

      {/* Form Container */}
      <motion.div
        className="bg-white bg-opacity-50 backdrop-blur-xl border border-gray-400 rounded-2xl md:rounded-3xl p-0 w-full max-w-md md:max-w-lg lg:max-w-2xl"
        style={{
          height: 'auto',
          minHeight: '600px',
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
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-black mb-8">Create an account</h1>
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
                  className="w-full h-16 px-4 bg-white border-0 rounded-2xl text-gray-500 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
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
                  className="w-full h-16 px-4 bg-white border-0 rounded-2xl text-gray-500 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full h-16 px-4 bg-white border-0 rounded-2xl text-gray-500 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full h-16 px-4 bg-white border-0 rounded-2xl text-gray-500 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
                  required
                />
              </motion.div>
              {error && <p className="text-red-500 text-center text-sm">{error}</p>}

              {/* Submit Button */}
              <motion.div
                className="pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <motion.button
                  type="submit"
                  className="w-full h-16 bg-gray-700 text-white font-bold text-xl rounded-2xl hover:bg-gray-800 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </motion.div>
            </form>

            {/* Login Link */}
            <motion.div
              className="flex items-center justify-center gap-2 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <span className="text-black font-semibold text-base">Already have an account?</span>
              <Link to="/auth/login" className="text-black font-semibold text-base hover:underline">
                Login
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
