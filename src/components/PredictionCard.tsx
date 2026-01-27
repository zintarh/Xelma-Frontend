import { useState } from "react";

interface PredictionCardProps {
  isWalletConnected?: boolean;
  isRoundActive?: boolean;
  onPrediction?: (prediction: PredictionData) => void;
}

interface PredictionData {
  direction: "UP" | "DOWN";
  stake: string;
  exactPrice?: string;
  isLegend: boolean;
}

const PredictionCard = ({
  isWalletConnected = false,
  isRoundActive = true,
  onPrediction,
}: PredictionCardProps) => {
  const [stake, setStake] = useState("");
  const [isLegend, setIsLegend] = useState(false);
  const [exactPrice, setExactPrice] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<
    "UP" | "DOWN" | null
  >(null);

  const isDisabled = !isWalletConnected || !isRoundActive;

  const handleFillClick = () => {
    // In a real app, this would fetch the user's wallet balance
    setStake("1000"); // Placeholder
  };

  const handlePrediction = (direction: "UP" | "DOWN") => {
    if (isDisabled || !stake) return;

    const predictionData: PredictionData = {
      direction,
      stake,
      exactPrice: isLegend ? exactPrice : undefined,
      isLegend,
    };

    setSelectedDirection(direction);
    onPrediction?.(predictionData);

    // Reset form after submission
    setTimeout(() => {
      setStake("");
      setExactPrice("");
      setIsLegend(false);
      setSelectedDirection(null);
    }, 500);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm max-w-[500px] transition-all duration-300 my-[140px] mx-auto mb-[40px] ${isDisabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <h2 className="font-['DM_Sans'] text-2xl font-bold leading-8 text-[#292D32] dark:text-gray-100 mb-7 text-center">
        Guess price prediction
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-7">
        <button
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl font-['DM_Sans'] text-lg font-bold border-2 border-transparent cursor-pointer transition-all duration-300 bg-[#F5F5F5] dark:bg-gray-700 text-[#292D32] dark:text-gray-100 hover:border-[#2C4BFD] hover:bg-[#F0F4FF] dark:hover:bg-gray-600
          ${selectedDirection === "UP" ? "bg-[#D1FAE5] dark:bg-[#064E3B] border-[#10B981] dark:border-[#10B981] text-[#047857] dark:text-[#6EE7B7] scale-[1.02] shadow-[0_0_0_4px_rgba(44,75,253,0.1)]" : "border-[#10B981] hover:bg-[#ECFDF5] dark:hover:bg-[#064E3B]"}`}
          onClick={() => handlePrediction("UP")}
          disabled={isDisabled || !stake}
          aria-label="Predict price goes UP"
        >
          <span className="text-3xl leading-none">↑</span>
          <span className="text-sm font-semibold tracking-wide">UP</span>
        </button>

        <button
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl font-['DM_Sans'] text-lg font-bold border-2 border-transparent cursor-pointer transition-all duration-300 bg-[#F5F5F5] dark:bg-gray-700 text-[#292D32] dark:text-gray-100 hover:border-[#2C4BFD] hover:bg-[#F0F4FF] dark:hover:bg-gray-600
          ${selectedDirection === "DOWN" ? "bg-[#FEE2E2] dark:bg-[#7F1D1D] border-[#EF4444] dark:border-[#EF4444] text-[#991B1B] dark:text-[#FCA5A5] scale-[1.02] shadow-[0_0_0_4px_rgba(44,75,253,0.1)]" : "border-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#7F1D1D]"}`}
          onClick={() => handlePrediction("DOWN")}
          disabled={isDisabled || !stake}
          aria-label="Predict price goes DOWN"
        >
          <span className="text-3xl leading-none">↓</span>
          <span className="text-sm font-semibold tracking-wide">DOWN</span>
        </button>
      </div>

      <div className="mb-6">
        <label
          htmlFor="stake-input"
          className="block font-['DM_Sans'] text-sm font-semibold text-[#6B7280] dark:text-gray-400 mb-2 uppercase tracking-wide"
        >
          Stake Amount
        </label>
        <div className="flex gap-2">
          <input
            id="stake-input"
            type="number"
            className="flex-1 p-3 border border-[#E5E7EB] dark:border-gray-600 rounded-lg font-['DM_Sans'] text-base text-[#292D32] dark:text-gray-100 bg-white dark:bg-gray-700 transition-all duration-300 focus:outline-none focus:border-[#2C4BFD] focus:shadow-[0_0_0_3px_rgba(44,75,253,0.1)] disabled:bg-[#F5F5F5] disabled:text-[#9B9B9B] disabled:cursor-not-allowed dark:disabled:bg-[#1F2937] dark:disabled:text-gray-500"
            placeholder="Enter stake amount"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            disabled={isDisabled}
            min="0"
            step="0.01"
          />
          <button
            className="px-6 py-3 bg-[#2C4BFD] text-white border-none rounded-lg font-['DM_Sans'] text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-[#1E3FD4] hover:-translate-y-px hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleFillClick}
            disabled={isDisabled}
            title="Fill with wallet balance"
          >
            Fill
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-5 h-5 cursor-pointer accent-[#2C4BFD] disabled:cursor-not-allowed disabled:opacity-50"
            checked={isLegend}
            onChange={(e) => setIsLegend(e.target.checked)}
            disabled={isDisabled}
          />
          <span className="font-['DM_Sans'] text-base font-medium text-[#292D32] dark:text-gray-100 cursor-pointer">
            I am a legend
          </span>
        </label>
      </div>

      {isLegend && (
        <div className="bg-[#F9FAFB] dark:bg-[#111827] rounded-lg p-4 mb-6 border border-[#E5E7EB] dark:border-gray-600 animate-[slideDown_0.3s_ease]">
          <label
            htmlFor="exact-price-input"
            className="block font-['DM_Sans'] text-sm font-semibold text-[#6B7280] dark:text-gray-400 mb-2 uppercase tracking-wide"
          >
            Exact Price Prediction
          </label>
          <input
            id="exact-price-input"
            type="number"
            className="w-full p-3 border border-[#E5E7EB] dark:border-gray-600 rounded-lg font-['DM_Sans'] text-base text-[#292D32] dark:text-gray-100 bg-white dark:bg-gray-700 transition-all duration-300 focus:outline-none focus:border-[#2C4BFD] focus:shadow-[0_0_0_3px_rgba(44,75,253,0.1)] disabled:bg-[#F5F5F5] disabled:text-[#9B9B9B] disabled:cursor-not-allowed dark:disabled:bg-[#1F2937] dark:disabled:text-gray-500 mb-0"
            placeholder="Enter exact price"
            value={exactPrice}
            onChange={(e) => setExactPrice(e.target.value)}
            disabled={isDisabled}
            step="0.01"
            min="0"
          />
          <p className="font-['DM_Sans'] text-[13px] text-[#6B7280] dark:text-gray-400 mt-2.5 leading-relaxed">
            Predict the exact price for a chance to win the legend bonus!
          </p>
        </div>
      )}

      {isDisabled && (
        <div className="bg-[#FEF3C7] dark:bg-[#78350F] border border-[#FBBF24] dark:border-[#F59E0B] rounded-lg p-3 mt-4 text-center">
          {!isWalletConnected && (
            <p className="font-['DM_Sans'] text-sm text-[#78350F] dark:text-[#FCD34D] m-0">
              Connect your wallet to make predictions
            </p>
          )}
          {isWalletConnected && !isRoundActive && (
            <p className="font-['DM_Sans'] text-sm text-[#78350F] dark:text-[#FCD34D] m-0">
              This round is not active
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionCard;
