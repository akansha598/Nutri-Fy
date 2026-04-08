import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Food2 from './assets/Food2.jpg';

export default function SignUp() {
  const [formData, setFormData] = useState({
    gender: '',
    health_condition: 'healthy' // Default value
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const conditions = [
    "healthy", "diabetes", "pcod", "pcos", "hypertension", "bp", 
    "obesity", "muscle_gain", "thyroid", "ckd", 
    "kidney_disease", "heart_disease", "cvd", 
    "high_cholesterol", "hyperthyroidism", "underweight"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, pwd, weight_kg, height_cm, age, gender, health_condition } = formData;

    // Validation
    if (!name || !email || !password || !pwd || !weight_kg || !height_cm || !age || !gender || !health_condition) {
      return toast.error('Please fill out all fields!');
    }

    if (password !== pwd) {
      return toast.error('Passwords do not match!');
    }

    try {
      setLoading(true);

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          weight_kg: Number(weight_kg),
          height_cm: Number(height_cm),
          age: Number(age),
          gender,
          health_condition
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        return toast.error(data.message || "Registration failed");
      }

      toast.success("Account created successfully! 🎉");
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

        <h2 className="text-center text-gray-400 text-sm mb-2">Personalize your nutrition journey</h2>

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

        <div className='flex gap-2'>
          <input
            type="number"
            placeholder='Weight (kg)'
            className='w-1/2 border border-gray-600 bg-transparent p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
            id='weight_kg'
            onChange={handleChange}
          />
          <input
            type="number"
            placeholder='Height (cm)'
            className='w-1/2 border border-gray-600 bg-transparent p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
            id='height_cm'
            onChange={handleChange}
          />
        </div>

        <div className='flex gap-2'>
          <input
            type="number"
            placeholder='Age'
            className='w-1/2 border border-gray-600 bg-transparent p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
            id='age'
            onChange={handleChange}
          />
          <select
            id="gender"
            onChange={handleChange}
            className='w-1/2 border border-gray-600 bg-[#1e293b] p-3 rounded-lg focus:outline-none focus:border-[#00df9a]'
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <select
          id="health_condition"
          onChange={handleChange}
          className='border border-gray-600 bg-[#1e293b] p-3 rounded-lg focus:outline-none focus:border-[#00df9a] capitalize'
        >
          {conditions.map((condition) => (
            <option key={condition} value={condition}>
              {condition.replace('_', ' ')}
            </option>
          ))}
        </select>

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
          className='bg-[#00df9a] text-black font-semibold py-3 rounded-full hover:bg-green-400 transition mt-2'
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