import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const receiver_id = searchParams.get('id');

  useEffect(() => {
    async function getValidity() {
      try {
        setLoading(true);
        const response = await fetch('https://api.donneur.ca/receiver/verify_link?receiver_id=' + receiver_id);
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Error verifying link');
        }
        
        if (result.status === 'ok') {
          // Link is valid, show password form
          setIsRegistered(false);
        } else {
          // User is already registered
          setIsRegistered(true);
        }
      } catch (err) {
        console.error(err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    }
    
    if (receiver_id) {
      getValidity();
    } else {
      setError('Missing receiver ID');
    }
  }, [receiver_id]);

  // Check if passwords match on each change
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true); // Don't show error when confirmPassword is empty
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('https://api.donneur.ca/receiver/create_app_account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id, 
          password,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setError(result.error || 'Error setting password');
      } else {
        setSuccess(true);
        // Could redirect after a delay
        // setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex w-screen h-[100svh] flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isRegistered || success) {
    return (
      <div className="flex w-screen h-[100svh] flex-col items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-medium text-gray-900">
            {isRegistered ? 'Already Registered' : 'Registration Complete'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isRegistered 
              ? 'You are already registered on Donneur.ca. Enjoy the service today!' 
              : 'Your account has been successfully created. You can now login to access the service.'}
          </p>
          <div className="mt-6">
            <button 
              onClick={() => navigate('/login')} 
              className="w-full text-white bg-black py-2 px-4 rounded-lg hover:bg-gray-800"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-screen h-[100svh] flex-col items-center justify-center">
      <div className="flex flex-col w-[350px] p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-6 text-center">Create Your Password</h1>
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="•••••••••"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label htmlFor="confirm_password" className="block mb-2 text-sm font-medium text-gray-900">
              Confirm password
            </label>
            <input
              type="password"
              id="confirm_password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                !passwordsMatch ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="•••••••••"
              required
            />
            {!passwordsMatch && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full text-white bg-black h-[40px] rounded-lg hover:bg-gray-800 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}