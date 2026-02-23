import React from 'react';
import { TypeAnimation } from 'react-type-animation';

const Hero = ({ takeInputRef }) => {

  const scrollToTakeInput = () => {
    if (takeInputRef?.current) {
    takeInputRef.current.scrollIntoView({ behavior: "smooth" });
  }
  };
  return (
    <div className='bg-gray-900 text-white'>
      <div className='max-w-[900px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center px-4'>
        
        <p className='text-green-400 font-bold p-2 uppercase tracking-wide'>
          AI-Powered Nutrition & Fitness
        </p>

        <h1 className='md:text-6xl sm:text-5xl text-4xl font-bold md:py-6'>
          Eat Smart. Train Better.
        </h1>

        <div className='flex justify-center items-center flex-wrap'>
          <p className='md:text-4xl sm:text-3xl text-xl font-bold py-4'>
            Track your
          </p>

          <TypeAnimation
            sequence={[
              ' Calories',
              2000,
              ' Macros',
              2000,
              ' Fitness Goals',
              2000,
              ' AI Meal Plans',
              2000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            className='md:text-4xl sm:text-3xl text-xl font-bold text-green-400 md:pl-4 pl-2'
          />
        </div>

        <p className='md:text-xl text-lg text-gray-400 max-w-[700px] mx-auto'>
          Monitor your daily nutrition, analyze macro & micro nutrients, 
          and receive personalized AI-based meal recommendations to 
          achieve your health goals faster.
        </p>

        <button
          onClick={scrollToTakeInput}
          className='bg-green-500 w-[200px] rounded-md font-semibold my-8 mx-auto py-3 text-black hover:bg-green-400 transition duration-300 shadow-lg hover:shadow-green-500/30'
        >
          Get Started
        </button>

      </div>
    </div>
  );
};

export default Hero;