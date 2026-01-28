import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const AgeVerification = ({ onVerify }) => {
  const [declined, setDeclined] = useState(false);

  const handleYes = () => {
    onVerify(true);
  };

  const handleNo = () => {
    setDeclined(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
        data-testid="age-verification-modal"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="max-w-md w-full mx-4 p-8 rounded-2xl bg-[#0A0A0A] border border-[#262626] text-center"
        >
          <div className="flex justify-center mb-6">
            <img
              src="https://customer-assets.emergentagent.com/job_mooki-single-vape/artifacts/yq4n0bz1_logo.jpg"
              alt="MOOKI STORE"
              className="w-20 h-20 rounded-xl"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-[#FF4500] mb-4 tracking-wider">
            MOOKI STORE
          </h1>
          
          {!declined ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#FF4500]" />
                <span className="text-lg font-semibold">Age Verification Required</span>
              </div>
              
              <p className="text-[#A1A1AA] mb-8">
                This website contains products intended for adults only. 
                You must be 18 years or older to enter.
              </p>
              
              <p className="text-xl font-semibold mb-6">
                Are you 18 years of age or older?
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleYes}
                  className="px-8 py-3 bg-[#FF4500] hover:bg-[#CC3700] text-white rounded-full font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,69,0,0.4)]"
                  data-testid="age-verify-yes-btn"
                >
                  Yes, I am 18+
                </Button>
                <Button
                  onClick={handleNo}
                  variant="outline"
                  className="px-8 py-3 border-[#262626] text-[#A1A1AA] hover:text-white hover:border-[#FF4500] rounded-full font-semibold transition-all duration-300"
                  data-testid="age-verify-no-btn"
                >
                  No
                </Button>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertTriangle className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#EF4444] mb-4">
                Access Denied
              </h2>
              <p className="text-[#A1A1AA]">
                You must be 18 years or older to access this website.
                Please close this window.
              </p>
            </motion.div>
          )}
          
          <p className="text-xs text-[#A1A1AA] mt-8">
            By entering, you confirm that you are of legal age to purchase vape products in your jurisdiction.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AgeVerification;
