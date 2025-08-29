
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Causes from './components/Causes';
import About from './components/About';
import Footer from './components/Footer';
import DonationModal from './components/DonationModal';
import { type Cause } from './types';
import { CAUSES } from './constants';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCause, setSelectedCause] = useState<Cause | null>(null);

  const handleOpenModal = useCallback((cause: Cause) => {
    setSelectedCause(cause);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCause(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main>
        <Hero />
        <Causes causes={CAUSES} onDonateClick={handleOpenModal} />
        <About />
      </main>
      <Footer />
      {isModalOpen && selectedCause && (
        <DonationModal
          cause={selectedCause}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default App;

