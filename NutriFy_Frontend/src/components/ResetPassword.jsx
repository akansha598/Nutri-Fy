import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Food2 from '../assets/Food2.jpg'; // Adjust path if asset is in parent folder

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, newPassword, confirmPassword } = formData;

    // 1. Validation
    if (!email || !newPassword || !confirmPassword) {
      return toast.error('Please fill out all fields!');
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match!');
    }

    try {
      setLoading(true);

      // 2. Use the dynamic Base URL environment logic
      const baseUrl = process.env.REACT_APP_API_URL || '';

      const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'PATCH', // Matching your Thunder Client screenshot method
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          newPassword
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        return toast.error(data.message || 'Failed to reset password.');
      }

      toast.success('Password reset successfully! 🔑');
      navigate('/sign-in');

    } catch (err) {
      setLoading(false);
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <section className='flex items-center justify-center min-h-screen bg-[#0f172a] text-white py-10'>
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 w-[450px] p-10 bg-[#1e293b] rounded-2xl shadow-xl'
      >
        <div className='flex items-center justify-center gap-3 pb-4'>
          <img src={Food2} height={60} width={60} alt="logo" className="rounded-full" />
          <span className='text-[#00df9a] text-3xl font-bold'>NutriFy</span>
        </div>

        <h2 className="text-center text-gray-400 text-sm mb-2">Reset Your Account Password</h2>

        <input
          type="email"
          placeholder='Email address'
          className='border border-gray-600 bg-transparent p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
          id='email'
          onChange={handleChange}
          value={formData.email}
        />

        <input
          type="password"
          placeholder='New Password'
          className='border border-gray-600 bg-transparent p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
          id='newPassword'
          onChange={handleChange}
          value={formData.newPassword}
        />

        <input
          type="password"
          placeholder='Confirm New Password'
          className='border border-gray-600 bg-transparent p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
          id='confirmPassword'
          onChange={handleChange}
          value={formData.confirmPassword}
        />

        <button
          type='submit'
          disabled={loading}
          className='bg-[#00df9a] text-black font-semibold py-3 rounded-full hover:bg-green-400 transition mt-2'
        >
          {loading ? "Updating Password..." : "Reset Password"}
        </button>

        <div className='flex gap-2 items-center justify-center pt-2'>
          <Link to='/sign-in'>
            <span className='text-[#00df9a] text-sm hover:underline'>
              Back to Sign In
            </span>
          </Link>
        </div>
      </form>
    </section>
  );
}