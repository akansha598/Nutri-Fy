import React from 'react';
import Food2 from '../assets/Food2.jpg'
import Food3 from '../assets/Food3.jpg'
import Food4 from '../assets/Food4.jpg'

const Cards = () => {
  return (
    <div className='w-full py-24 px-4 bg-gray-50'>
      <div className='max-w-[1240px] mx-auto text-center mb-16'>
        <h2 className='text-4xl font-bold'>Choose Your Plan</h2>
        <p className='text-gray-600 mt-4'>
          Flexible pricing for your health and fitness journey.
        </p>
      </div>

      <div className='max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8'>

        {/* BASIC PLAN */}
        <div className='w-full shadow-xl flex flex-col p-6 my-4 rounded-xl bg-white hover:scale-105 duration-300'>
          <img className='w-20 mx-auto mt-[-3rem] bg-white rounded-full p-2 shadow-md' src={Food2} alt="Basic Plan" />
          <h2 className='text-2xl font-bold text-center py-6'>Basic</h2>
          <p className='text-center text-4xl font-bold'>Free</p>

          <div className='text-center font-medium mt-6'>
            <p className='py-2 border-b mx-8'>Daily Calorie Tracking</p>
            <p className='py-2 border-b mx-8'>Macro Monitoring</p>
            <p className='py-2 border-b mx-8'>Basic Progress Stats</p>
          </div>

          <button className='bg-green-600 text-white w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3 hover:bg-green-700 transition'>
            Get Started
          </button>
        </div>

        {/* PRO PLAN */}
        <div className='w-full shadow-xl bg-white flex flex-col p-6 md:my-0 my-8 rounded-xl hover:scale-105 duration-300 border-2 border-green-600'>
          <img className='w-20 mx-auto mt-[-3rem] bg-white rounded-full p-2 shadow-md' src={Food3} alt="Pro Plan" />
          <h2 className='text-2xl font-bold text-center py-6'>Pro</h2>
          <p className='text-center text-4xl font-bold'>$9<span className='text-lg'>/month</span></p>

          <div className='text-center font-medium mt-6'>
            <p className='py-2 border-b mx-8'>Advanced Nutrient Insights</p>
            <p className='py-2 border-b mx-8'>Custom Fitness Goals</p>
            <p className='py-2 border-b mx-8'>Progress Analytics Dashboard</p>
          </div>

          <button className='bg-green-600 text-white w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3 hover:bg-green-700 transition'>
            Upgrade Now
          </button>
        </div>

        {/* AI PREMIUM PLAN */}
        <div className='w-full shadow-xl flex flex-col p-6 my-4 rounded-xl bg-white hover:scale-105 duration-300'>
          <img className='w-20 mx-auto mt-[-3rem] bg-white rounded-full p-2 shadow-md' src={Food4} alt="AI Premium Plan" />
          <h2 className='text-2xl font-bold text-center py-6'>AI Premium</h2>
          <p className='text-center text-4xl font-bold'>$19<span className='text-lg'>/month</span></p>

          <div className='text-center font-medium mt-6'>
            <p className='py-2 border-b mx-8'>AI Meal Recommendations</p>
            <p className='py-2 border-b mx-8'>Personalized Diet Plans</p>
            <p className='py-2 border-b mx-8'>Priority Support</p>
          </div>

          <button className='bg-green-600 text-white w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3 hover:bg-green-700 transition'>
            Go Premium
          </button>
        </div>

      </div>
    </div>
  );
};

export default Cards;