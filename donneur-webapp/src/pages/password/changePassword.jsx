import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ChangePassword() {

  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const receiver_id = searchParams.get('id');


  useEffect( async () => {
    try {
      const response = await fetch('https://api.donneur.ca/is_password_link_valid?id='+receiver_id, {
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Error setting password');
      } else {
        if (result.validity != true){
          window.location.href = 'https://www.google.com';
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error setting password');
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('https://api.donneur.ca/set_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id, // used to locate the receiver record and get the email
          password,    // new password to create the auth account
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        // setError(result.error || 'Error setting password');
      } else {
        // Password has been set and auth account created.
        // Redirect to login or donation page as needed.
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      // setError('Error setting password');
    }
  }; 

  return (
    <div className="flex w-screen h-[100svh] flex-col items-center justify-center">
      <div className="flex flex-col w-[350px] h-[300px]">
        {/* Password Field */}
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password} // <-- Link state
            onChange={(e) => setPassword(e.target.value)} // <-- Handle change
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="•••••••••"
            required
          />
        </div>

        {/* Confirm Password Field */}
        <div className="mb-6">
          <label htmlFor="confirm_password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Confirm password
          </label>
          <input
            type="password"
            id="confirm_password"
            value={confirmPassword} // <-- Link state
            onChange={(e) => setConfirmPassword(e.target.value)} // <-- Handle change
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="•••••••••"
            required
          />
        </div>

        {/* Submit Button */}
        <button className="w-full text-white bg-black h-[40px] rounded-lg">Create</button>
      </div>
    </div>
  );
}
