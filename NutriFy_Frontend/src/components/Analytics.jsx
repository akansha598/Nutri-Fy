import React from 'react';
import Food1 from '../assets/Food1.jpg';

const Analytics = () => {
  return (
    <div className='w-full bg-white py-20 px-4'>
      <div className='max-w-[1240px] mx-auto grid md:grid-cols-2 gap-12 items-center'>
        
        {/* Image Section */}
        <img 
          className='w-[500px] mx-auto my-4 rounded-xl shadow-lg' 
          src={Food1} 
          alt='Nutrition Dashboard' 
        />

        {/* Text Section */}
        <div className='flex flex-col justify-center'>
          <p className='text-green-600 font-bold uppercase tracking-wide'>
            Smart Nutrition Tracking
          </p>

          <h1 className='md:text-4xl sm:text-3xl text-2xl font-bold py-3'>
            Manage Your Calories & Fitness in One Place
          </h1>

          <p className='text-gray-600'>
            Nutrify helps you monitor daily calorie intake, track macro and micro 
            nutrients, and receive AI-powered meal suggestions tailored to your 
            fitness goals. Whether you're aiming for weight loss, muscle gain, 
            or a balanced lifestyle — we’ve got you covered.
          </p>

          <p className='text-gray-600 mt-4'>
            Visualize your progress, analyze nutritional patterns, and build 
            healthy habits with a centralized nutrition dashboard designed 
            to keep you motivated every day.
          </p>

          <button className='bg-green-600 text-white w-[200px] rounded-md font-medium my-6 py-3 hover:bg-green-700 transition'>
            Explore Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default Analytics;