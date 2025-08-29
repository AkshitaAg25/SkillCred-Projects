import React from 'react';
import { type Cause } from '../types';
import CauseCard from './CauseCard';

interface CausesProps {
  causes: Cause[];
  onDonateClick: (cause: Cause) => void;
}

const Causes: React.FC<CausesProps> = ({ causes, onDonateClick }) => {
  return (
    <section id="causes" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Our Causes</h2>
          <p className="text-lg text-gray-600 mt-2">Choose a cause that speaks to your heart.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {causes.map((cause, index) => (
            <div key={cause.id} className="fade-in-up" style={{ animationDelay: `${index * 150}ms`}}>
              <CauseCard cause={cause} onDonateClick={onDonateClick} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Causes;