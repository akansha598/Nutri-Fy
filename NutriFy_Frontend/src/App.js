import React, { useRef } from 'react';
import { Routes, Route } from 'react-router-dom';

import Analytics from './components/Analytics';
import Cards from './components/Cards';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import TakeInput from './components/TakeInput';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { ToastContainer } from 'react-toastify';

function App() {
  const takeInputRef = useRef(null);

  // Home page layout kept inside App to preserve ref
  const HomePage = () => (
    <>
      <Hero takeInputRef={takeInputRef} />
      <Analytics />

      {/* Daily Meals Section Header */}
      <div className="py-10 px-4" style={{ 
        background: 'linear-gradient(135deg, #0f3d2e 0%, #14532d 25%, #166534 50%, #14532d 75%, #0f3d2e 100%)', 
        opacity: 0.95 
      }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#ecfdf5' }}>
            Add meals your way
          </h2>
          <p className="text-xl italic md:text-2xl font-light leading-relaxed" style={{ color: '#ecfdf5' }}>
            Enter your meals manually or upload a photo, all in a quick and simple way.
          </p>
        </div>
      </div>

      <div ref={takeInputRef}>
        <TakeInput />
      </div>

      <Cards />
    </>
  );

  return (
    <>
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    pauseOnHover
    theme="dark"
  />
  
  <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>

      <Footer />
    </div>
</>
    
  );
}

export default App;