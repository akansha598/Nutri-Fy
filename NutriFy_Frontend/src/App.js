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