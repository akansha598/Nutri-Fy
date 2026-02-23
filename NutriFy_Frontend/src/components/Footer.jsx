import React from 'react';
import {
  FaFacebookSquare,
  FaGithubSquare,
  FaInstagram,
  FaTwitterSquare,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <div className='bg-gray-900 text-gray-300'>
      <div className='max-w-[1240px] mx-auto py-16 px-4 grid lg:grid-cols-3 gap-8'>
        
        {/* LEFT SECTION */}
        <div>
          <h1 className='w-full text-3xl font-bold text-green-500'>
            NutriFy
          </h1>

          <p className='py-4 text-gray-400'>
            Nutrify helps you track calories, monitor nutrients, and receive 
            AI-powered meal recommendations to achieve your fitness and 
            health goals with confidence.
          </p>

          <div className='flex gap-6 my-6 text-gray-400'>
            <FaFacebookSquare size={28} className='hover:text-green-500 cursor-pointer transition' />
            <FaInstagram size={28} className='hover:text-green-500 cursor-pointer transition' />
            <FaTwitterSquare size={28} className='hover:text-green-500 cursor-pointer transition' />
            <FaGithubSquare size={28} className='hover:text-green-500 cursor-pointer transition' />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className='lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8 mt-6'>

          <div>
            <h6 className='font-semibold text-gray-400 mb-4'>Features</h6>
            <ul>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Calorie Tracking</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Macro Insights</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>AI Meal Plans</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Progress Analytics</li>
            </ul>
          </div>

          <div>
            <h6 className='font-semibold text-gray-400 mb-4'>Support</h6>
            <ul>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Pricing</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Help Center</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>FAQs</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Contact</li>
            </ul>
          </div>

          <div>
            <h6 className='font-semibold text-gray-400 mb-4'>Company</h6>
            <ul>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>About Us</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Blog</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Careers</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Partners</li>
            </ul>
          </div>

          <div>
            <h6 className='font-semibold text-gray-400 mb-4'>Legal</h6>
            <ul>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Privacy Policy</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Terms of Service</li>
              <li className='py-2 text-sm hover:text-green-500 cursor-pointer'>Cookie Policy</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Line */}
      <div className='text-center py-6 border-t border-gray-800 text-gray-500 text-sm'>
        © 2026 NutriFy. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;