import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Food2 from './assets/Food2.jpg';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.pwd) {
      return toast.error('Please fill out all fields!');
    }

    if (formData.password !== formData.pwd) {
      return toast.error('Passwords do not match!');
    }

    try {
      setLoading(true);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        return toast.error(data.message);
      }

      toast.success("Account created successfully! 🎉");
      navigate('/sign-in');

    } catch (err) {
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <section className='flex items-center justify-center min-h-screen bg-[#0f172a] text-white'>
      
      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 w-[400px] p-10 bg-[#1e293b] rounded-2xl shadow-xl'
      >
        <div className='flex items-center justify-center gap-3 pb-4'>
          <img src={Food2} height={60} width={60} alt="logo" />
          <span className='text-[#00df9a] text-3xl font-bold'>NutriFy</span>
        </div>

        <input
          type="text"
          placeholder='Full Name'
          className='border border-gray-600 bg-transparent p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
          id='name'
          onChange={handleChange}
        />

        <input
          type="email"
          placeholder='Email address'
          className='border border-gray-600 bg-transparent p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
          id='email'
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder='Password'
          className='border border-gray-600 bg-transparent p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
          id='password'
          onChange={handleChange}
        />

        <input
          type="password"
          placeholder='Confirm Password'
          className='border border-gray-600 bg-transparent p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
          id='pwd'
          onChange={handleChange}
        />

        <button
          type='submit'
          disabled={loading}
          className='bg-[#00df9a] text-black font-semibold py-3 rounded-full hover:bg-green-400 transition'
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className='flex gap-2 items-center justify-center pt-2'>
          <p className='text-gray-400 text-sm'>Already have an account?</p>
          <Link to='/sign-in'>
            <span className='text-[#00df9a] text-sm hover:underline'>
              Sign In
            </span>
          </Link>
        </div>

      </form>
    </section>
  );
}