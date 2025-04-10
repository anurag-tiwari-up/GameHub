import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/home'); // Adjust the path to your main app page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center text-white">
      <div className="text-center px-6">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-wide">Welcome to GameZone</h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-md mx-auto">
          Enter the arena. Compete. Win. Let the games begin.
        </p>
        <button
          onClick={handleContinue}
          className="bg-pink-600 hover:bg-pink-500 transition-colors px-8 py-3 text-lg font-semibold rounded-full shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
