import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { signOutSuccess } from '../redux/user/userSlice.js';
import { toast } from 'react-toastify';

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${baseUrl}/api/auth/signout`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.message);
      }

      dispatch(signOutSuccess());
      toast.success(data.message);
      navigate('/sign-in');
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="flex justify-between items-center h-20 max-w-[1240px] mx-auto px-4 text-white">

      {/* Logo */}
      <Link to="/">
        <h1 className="text-3xl font-bold text-[#00df9a] cursor-pointer">
          NutriFy
        </h1>
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-center gap-6">

        <Link to="/" className="hover:text-[#00df9a]">Home</Link>
        <li className="hover:text-[#00df9a] cursor-pointer">Features</li>
        <li className="hover:text-[#00df9a] cursor-pointer">About</li>
        <li className="hover:text-[#00df9a] cursor-pointer">Contact</li>

        {/* ✅ NEW ANALYZE BUTTON */}
        {currentUser && (
          <Link to="/analyze">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition">
              Analyze
            </button>
          </Link>
        )}

        {/* ✅ Manage Profile Button */}
        {currentUser && (
          <Link to="/manage-Profile">
            <button className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
              ManageProfile
            </button>
          </Link>
        )}

        {/* Auth */}
        {currentUser ? (
          <button
            onClick={handleSignOut}
            className="bg-[#00df9a] text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition"
          >
            Sign Out
          </button>
        ) : (
          <Link to="/sign-in">
            <button className="bg-[#00df9a] text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition">
              Sign In
            </button>
          </Link>
        )}
      </ul>

      {/* Mobile Toggle */}
      <div onClick={() => setNav(!nav)} className="block md:hidden">
        {nav ? <AiOutlineClose size={25} /> : <AiOutlineMenu size={25} />}
      </div>

      {/* Mobile Menu */}
      <ul
        className={
          nav
            ? "fixed left-0 top-0 w-[70%] h-full bg-[#000300] p-6 ease-in-out duration-500 md:hidden"
            : "fixed left-[-100%]"
        }
      >
        <h1 className="text-3xl font-bold text-[#00df9a] mb-6">NutriFy</h1>

        <Link to="/" onClick={() => setNav(false)}>
          <li className="py-4 border-b border-gray-600">Home</li>
        </Link>

        <li className="py-4 border-b border-gray-600">Features</li>
        <li className="py-4 border-b border-gray-600">About</li>
        <li className="py-4 border-b border-gray-600">Contact</li>

        {/* ✅ Analyze Button Mobile */}
        {currentUser && (
          <Link to="/analyze" onClick={() => setNav(false)}>
            <li className="py-4 border-b border-gray-600">
              Analyze
            </li>
          </Link>
        )}

        {/* ✅ Manage Profile Mobile */}
        <Link to="/profile" onClick={() => setNav(false)}>
          <li className="py-4 border-b border-gray-600">
            ManageProfile
          </li>
        </Link>

        {/* Auth */}
        <div className="mt-6">
          {currentUser ? (
            <button
              onClick={handleSignOut}
              className="bg-[#00df9a] text-black w-full py-2 rounded-lg font-semibold"
            >
              Sign Out
            </button>
          ) : (
            <Link to="/sign-in">
              <button className="bg-[#00df9a] text-black w-full py-2 rounded-lg font-semibold">
                Sign In
              </button>
            </Link>
          )}
        </div>
      </ul>
    </div>
  );
};

export default Navbar;