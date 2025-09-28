import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { SimpleIcon } from '../../components/icons/SimpleIcons';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      });
    } catch (err) {
      console.error('Registration error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#CED697'}}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 border-2 border-black rounded-xl flex items-center justify-center mb-4" style={{backgroundColor: '#98B8D6'}}>
            <span className="text-black font-bold text-lg font-body">I</span>
          </div>
          <h2 className="text-3xl font-bold text-black font-body">Join intrst today</h2>
          <p className="mt-2 text-sm text-black font-body">
            Create your account and start your smart finance journey
          </p>
        </div>

        {/* Form */}
        <div className="border-2 border-black rounded-lg p-6" style={{backgroundColor: '#E2DBAD'}}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-black mb-1 font-body">
                  First Name
                </label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  type="text"
                  autoComplete="given-name"
                  className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600 font-body">{errors.firstName.message}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-black mb-1 font-body">
                  Last Name
                </label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  type="text"
                  autoComplete="family-name"
                  className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="mt-1 text-sm text-red-600 font-body">{errors.lastName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-1 font-body">
                  Email address
                </label>
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
                  className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 font-body">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black mb-1 font-body">
                  Password
                </label>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Create a password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600 font-body">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-1 font-body">
                  Confirm Password
                </label>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`w-full px-3 py-2 text-sm border-2 border-black rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-black text-black bg-white ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 font-body">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            {/* Terms */}
            <div className="flex items-center">
              <input
                {...register('acceptTerms', {
                  required: 'You must accept the terms and conditions'
                })}
                id="acceptTerms"
                type="checkbox"
                className="h-4 w-4 text-black focus:ring-black border-2 border-black rounded"
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-black font-body">
                I agree to the{' '}
                <a href="#" className="text-black underline hover:no-underline font-medium font-body">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-black underline hover:no-underline font-medium font-body">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-600 font-body">{errors.acceptTerms.message}</p>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed px-4 border-2 border-black rounded-lg font-medium text-white bg-black hover:bg-gray-800 transition-colors font-body"
              >
                {isLoading ? <LoadingSpinner size="small" /> : 'Create Account'}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-black font-body">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-black underline hover:no-underline font-body">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  
};

export default Register;