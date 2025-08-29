
import React, { useState, useEffect } from 'react';

const Hero: React.FC = () => {
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-gray-900 text-white overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1920&auto=format&fit=crop)`,
          transform: `translateY(${offsetY * 0.4}px)`,
          opacity: 0.5
        }}
        aria-hidden="true"
      />
      <div className="relative container mx-auto px-6 py-32 md:py-48 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4 fade-in-up" style={{ animationDelay: '200ms' }}>
          Your Kindness, Their Future.
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-200 fade-in-up" style={{ animationDelay: '400ms' }}>
          Join a community of changemakers dedicated to creating a better world. Every donation, big or small, fuels progress and transforms lives.
        </p>
        <a
          href="#causes"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 fade-in-up pulse"
          style={{ animationDelay: '600ms' }}
        >
          Explore Causes
        </a>
      </div>
    </div>
  );
};

export default Hero;