import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePigeonStore } from '../store/pigeonStore';
import { ArrowLeft } from 'lucide-react';

export const SendFlow = () => {
  const navigate = useNavigate();
  const { party, fetchParty } = usePigeonStore();
  const [step, setStep] = useState(1);
  const [selectedPigeon, setSelectedPigeon] = useState<number | null>(null);
  const [messageBody, setMessageBody] = useState('');

  useEffect(() => {
    fetchParty();
  }, []);

  const handleSend = () => {
    // Show flight animation
    setStep(3);

    // Navigate back after animation
    setTimeout(() => {
      navigate('/home');
    }, 3000);
  };

  const selectedPigeonData = party.find(p => p.id === selectedPigeon);

  return (
    <div className="h-full flex flex-col p-4">
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/home')}
          className="p-2 hover:bg-ui-panel rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-neon-cyan">Send Message</h1>
      </header>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepContainer key="step1" title="Choose Your Pigeon">
            <div className="grid grid-cols-2 gap-4">
              {party.length === 0 ? (
                <p className="col-span-2 text-gray-400 text-center">No pigeons available</p>
              ) : (
                party.map((pigeon) => (
                  <PigeonCard
                    key={pigeon.id}
                    pigeon={pigeon}
                    isSelected={selectedPigeon === pigeon.id}
                    onClick={() => {
                      setSelectedPigeon(pigeon.id);
                      setStep(2);
                    }}
                  />
                ))
              )}
            </div>
          </StepContainer>
        )}

        {step === 2 && (
          <StepContainer key="step2" title="Write Your Scroll">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-ui-panel rounded-lg">
                <div className="text-4xl">🕊️</div>
                <div>
                  <p className="font-bold">{selectedPigeonData?.name}</p>
                  <p className="text-sm text-gray-400">Level {selectedPigeonData?.level}</p>
                </div>
              </div>

              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Your message..."
                rows={6}
                className="w-full bg-ui-panel border-2 border-ui-border rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:border-neon-cyan focus:outline-none transition-colors"
                autoFocus
              />

              <button
                onClick={handleSend}
                disabled={!messageBody.trim()}
                className="btn-primary w-full"
              >
                Send Scroll 📜
              </button>
            </div>
          </StepContainer>
        )}

        {step === 3 && (
          <FlightAnimation key="flight" pigeonName={selectedPigeonData?.name || 'Pigeon'} />
        )}
      </AnimatePresence>
    </div>
  );
};

const StepContainer = ({ title, children }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="flex-1 flex flex-col"
  >
    <h2 className="text-xl font-bold mb-6">{title}</h2>
    {children}
  </motion.div>
);

const PigeonCard = ({ pigeon, isSelected, onClick }: any) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`panel ${isSelected ? 'border-neon-cyan shadow-neon' : ''}`}
  >
    <div className="text-4xl mb-2">🕊️</div>
    <h3 className="font-bold">{pigeon.name}</h3>
    <p className="text-sm text-gray-400">Lv. {pigeon.level}</p>
    <p className="text-xs text-neon-cyan mt-1">{pigeon.trait}</p>
  </motion.button>
);

const FlightAnimation = ({ pigeonName }: any) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex-1 flex flex-col items-center justify-center"
  >
    <motion.div
      animate={{ y: [-20, 20, -20] }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="text-8xl mb-8"
    >
      🕊️
    </motion.div>
    <p className="text-xl font-bold text-neon-cyan mb-2">
      {pigeonName} is flying...
    </p>
    <p className="text-sm text-gray-400">Your message has been sent!</p>
  </motion.div>
);
