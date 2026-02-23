import React, { useState } from 'react';
import { GiSpikedBall } from "react-icons/gi";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from './redux/user/userSlice.js';
import Food1 from './assets/Food1.jpg';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return toast.error('Please fill out all fields!');
    }

    try {
      dispatch(signInStart());

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch(signInFailure(data.message));
        return toast.error(data.message);
      }

      dispatch(signInSuccess(data));
      toast.success("Welcome back to NutriFy! 💚");
      navigate('/');
    } catch (err) {
      dispatch(signInFailure(err.message));
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <section className='flex flex-col md:flex-row items-center justify-evenly pt-20 min-h-screen bg-[#0f172a] text-white'>

      {/* Left Content */}
      <div className='p-10 max-w-xl'>
        <h2 className='text-4xl font-extrabold pb-6 text-[#00df9a]'>
          AI-Powered Nutrition & Fitness
        </h2>

        <ul className='flex flex-col gap-4'>
          <li className='flex text-lg gap-2 items-start'>
            <GiSpikedBall className="text-[#00df9a] mt-1" />
            Track your daily calories, macros & micro nutrients effortlessly.
          </li>

          <li className='flex text-lg gap-2 items-start'>
            <GiSpikedBall className="text-[#00df9a] mt-1" />
            Get personalized AI-based meal recommendations tailored to your goals.
          </li>

          <li className='flex text-lg gap-2 items-start'>
            <GiSpikedBall className="text-[#00df9a] mt-1" />
            Monitor fitness progress and improve performance smarter.
          </li>

          <li className='flex text-lg gap-2 items-start'>
            <GiSpikedBall className="text-[#00df9a] mt-1" />
            Achieve weight loss, muscle gain, or maintenance goals faster.
          </li>
        </ul>
      </div>

      {/* Sign In Form */}
      <div>
        <form
          onSubmit={handleSubmit}
          className='flex flex-col gap-4 m-10 p-10 bg-[#1e293b] rounded-2xl shadow-xl'
        >
          <div className='flex items-center justify-center gap-3 pb-4'>
            <img src={Food1} height={60} width={60} alt="logo" />
            <span className='text-[#00df9a] text-3xl font-bold'>
              NutriFy
            </span>
          </div>

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

          <button
            type='submit'
            className='bg-[#00df9a] text-black font-semibold py-3 rounded-full hover:bg-green-400 transition'
          >
            Sign In
          </button>

          <div className='flex gap-2 items-center justify-center pt-2'>
            <p className='text-gray-400 text-sm'>Don't have an account?</p>
            <Link to='/sign-up'>
              <span className='text-[#00df9a] text-sm hover:underline'>
                Sign Up
              </span>
            </Link>
          </div>
        </form>
      </div>

    </section>
  );
}