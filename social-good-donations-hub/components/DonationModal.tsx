import React, { useState, useCallback, useEffect, Fragment } from 'react';
import { type Cause } from '../types';
import { generateThankYouContent } from '../services/geminiService';
import Spinner from './Spinner';

interface DonationModalProps {
  cause: Cause;
  onClose: () => void;
}

type ModalStep = 'details' | 'payment' | 'generating' | 'thankyou';
const PRESET_AMOUNTS = [25, 50, 100, 250];

const generatingMessages = [
  "Securing your donation details...",
  "Contacting our impact team...",
  "Crafting your personalized thank you message...",
  "Summarizing your incredible impact...",
  "Just a moment more...",
];

const ProgressIndicator: React.FC<{ step: ModalStep }> = ({ step }) => {
  const steps = ['details', 'payment', 'thankyou'];
  const stepMap: { [key in ModalStep]: number } = {
    details: 0,
    payment: 1,
    generating: 2,
    thankyou: 2,
  };
  const currentStepIndex = stepMap[step];

  return (
    <div className="w-full px-8 md:px-12 mb-6">
      <div className="flex items-center">
        {steps.map((s, index) => (
          <Fragment key={s}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index <= currentStepIndex
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStepIndex ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-2 text-xs font-semibold capitalize w-16 ${
                  index <= currentStepIndex
                    ? 'text-emerald-600'
                    : 'text-gray-400'
                }`}
              >
                {s === 'thankyou' ? 'Complete' : s}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 transition-all duration-500 ${
                  index < currentStepIndex ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

const DonationModal: React.FC<DonationModalProps> = ({ cause, onClose }) => {
  const [step, setStep] = useState<ModalStep>('details');
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<{
    email: string;
    impact: string;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 'generating') {
      interval = setInterval(() => {
        setCurrentMessageIndex(
          (prevIndex) => (prevIndex + 1) % generatingMessages.length
        );
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setAmount(Number(value) || 0);
    }
  };

  const validateAndProceed = () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (amount <= 0) {
      setError('Please select or enter a valid donation amount.');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePayment = useCallback(async () => {
    try {
      setStep('generating');

      // Call backend donation API
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: name,
          donorEmail: email,
          donationAmount: amount,
          causeTitle: cause.title,
        }),
      });

      if (!res.ok) throw new Error('Donation failed');
      const data = await res.json();

      setGeneratedContent({
        email: data.email || 'Thank you for donating!',
        impact:
          data.impact ||
          `Your donation of $${amount} helps us greatly for ${cause.title}.`,
      });

      setStep('thankyou');
    } catch (err) {
      console.error(err);
      setError('Something went wrong while processing your donation.');
      setStep('payment');
    }
  }, [name, email, amount, cause.title]);

  const handleDone = async () => {
    try {
      setIsSendingEmail(true);
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          amount,
          cause: cause.title,
          message: generatedContent?.email ?? undefined,
        }),
      });
    } catch (e) {
      console.error('Email send failed:', e);
    } finally {
      setIsSendingEmail(false);
      onClose();
    }
  };

  const handleCopyToClipboard = () => {
    if (generatedContent?.email) {
      navigator.clipboard.writeText(generatedContent.email);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // ---------- UI Renders ----------
  const renderDetailsStep = () => (
    <>
      <h3 className="text-2xl font-bold mb-2 text-gray-800">
        Support {cause.title}
      </h3>
      <p className="text-gray-600 mb-6">{cause.longDescription}</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose an amount
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => handleAmountSelect(preset)}
              className={`py-3 px-2 border rounded-lg font-semibold transition-all duration-200 ${
                amount === preset && customAmount === ''
                  ? 'bg-emerald-500 text-white border-emerald-500 ring-2 ring-emerald-300'
                  : 'bg-white hover:bg-gray-100 border-gray-300'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={customAmount}
          onChange={handleCustomAmountChange}
          placeholder="Or enter custom amount"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={validateAndProceed}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
      >
        Proceed to Payment
      </button>
    </>
  );

  const renderPaymentStep = () => (
    <>
      <h3 className="text-2xl font-bold mb-4">Confirm Your Donation</h3>
      <div className="bg-gray-100 p-6 rounded-lg mb-6 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Cause:</span>
          <span className="font-semibold text-gray-800">{cause.title}</span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
          <span className="text-gray-600 text-lg">Total Donation:</span>
          <span className="font-bold text-2xl text-emerald-600">
            ${amount}
          </span>
        </div>
      </div>
      <p className="text-center text-gray-500 mb-6 text-sm">
        This is a simulated payment process for demonstration purposes. No real
        transaction will occur.
      </p>
      <button
        onClick={handlePayment}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
      >
        Confirm Donation
      </button>
      <button
        onClick={() => setStep('details')}
        className="w-full mt-2 text-sm text-gray-600 hover:text-black"
      >
        Go Back
      </button>
    </>
  );

  const renderGeneratingStep = () => (
    <div className="text-center py-12 flex flex-col items-center justify-center min-h-[350px]">
      <Spinner />
      <h3 className="text-2xl font-bold mt-6 text-gray-800">
        Finalizing Your Contribution
      </h3>
      <p className="text-gray-600 mt-2 transition-opacity duration-500 h-6">
        {generatingMessages[currentMessageIndex]}
      </p>
    </div>
  );

  const renderThankYouStep = () =>
    generatedContent && (
      <div className="fade-in-up">
        <div className="text-center mb-8">
          <div className="mx-auto bg-emerald-100 rounded-full h-16 w-16 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mt-4">
            Thank You, {name}!
          </h2>
          <p className="text-gray-600">
            Your generosity is making a real difference.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 space-y-6 border border-gray-200">
          <div>
            <h4 className="font-bold text-lg mb-2 text-gray-800">
              Your Impact Summary
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap">
              {generatedContent.impact}
            </p>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-lg text-gray-800">
                A Message For You
              </h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded-lg transition-colors flex items-center space-x-1"
                >
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent(
                    `Thank you for your donation to ${cause.title}!`
                  )}&body=${encodeURIComponent(generatedContent.email)}`}
                  className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded-lg transition-colors"
                >
                  Open
                </a>
              </div>
            </div>
            <div className="bg-white p-4 rounded-md border">
              <p className="text-gray-700 whitespace-pre-wrap">
                {generatedContent.email}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              A thank you email has been prepared for you to send to{' '}
              <strong>{email}</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={handleDone}
          disabled={isSendingEmail}
          className="mt-8 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {isSendingEmail ? 'Finishing...' : 'Done'}
        </button>
      </div>
    );

  const STEPS: { [K in ModalStep]: React.ReactNode } = {
    details: renderDetailsStep(),
    payment: renderPaymentStep(),
    generating: renderGeneratingStep(),
    thankyou: renderThankYouStep() || null,
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 fade-in-up"
      style={{ animationDuration: '0.3s' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative flex flex-col">
        <div className="pt-8">
          {step !== 'thankyou' && step !== 'generating' && (
            <ProgressIndicator step={step} />
          )}
        </div>
        <div className="p-8 md:p-12 pt-4 flex-grow">{STEPS[step]}</div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DonationModal;
