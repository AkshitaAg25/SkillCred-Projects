import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">About ImpactHub</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          ImpactHub was founded on a simple but powerful idea: that technology can bridge the gap between those who want to help and the causes that need it most. We are a passionate team dedicated to creating a transparent, engaging, and effective platform for social good.
        </p>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Our mission is to empower changemakers like you to make a real, tangible difference in the world. We partner with vetted, high-impact organizations to ensure your donation reaches the people and projects where it can do the most good. Join us in building a better, kinder future for everyone.
        </p>
      </div>
    </section>
  );
};

export default About;


