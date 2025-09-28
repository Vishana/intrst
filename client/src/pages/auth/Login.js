import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SimpleIcon } from '../../components/icons/SimpleIcons';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#98B8D6'}}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 border-2 border-black rounded-xl flex items-center justify-center mb-4" style={{backgroundColor: '#E2DBAD'}}>
            <span className="text-black font-bold text-lg font-body">I</span>
          </div>
          <h2 className="text-3xl font-bold text-black font-body">
            Welcome back to intrst
          </h2>
          <p className="mt-2 text-sm text-black font-body">
            Sign in to your account to continue your financial journey
          </p>
        </div>

        {/* Form */}
        <div className="border-2 border-black rounded-lg p-6" style={{backgroundColor: '#CED697'}}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-1 font-body">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SimpleIcon name="mail" size={20} className="text-gray-600" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    type="email"
                    autoComplete="email"
                    className={`w-full pl-10 px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 font-body">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black mb-1 font-body">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SimpleIcon name="lock" size={20} className="text-gray-600" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`w-full pl-10 pr-10 px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                      {showPassword ? (
                        <SimpleIcon name="eyeOff" size={20} />
                      ) : (
                        <SimpleIcon name="eye" size={20} />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 font-body">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed px-4 border-2 border-black rounded-lg font-medium text-white bg-black hover:bg-gray-800 transition-colors font-body"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-black font-body">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-black underline hover:no-underline font-body"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;
