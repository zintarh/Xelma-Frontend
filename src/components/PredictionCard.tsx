import { useState } from "react";
import "./PredictionCard.css";

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
  const [selectedDirection, setSelectedDirection] = useState<"UP" | "DOWN" | null>(null);

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
    <div className={`prediction-card ${isDisabled ? "prediction-card--disabled" : ""}`}>
      <h2 className="prediction-card__title">Guess price prediction</h2>

      <div className="prediction-card__buttons">
        <button
          className={`prediction-card__button prediction-card__button--up ${
            selectedDirection === "UP" ? "prediction-card__button--active" : ""
          }`}
          onClick={() => handlePrediction("UP")}
          disabled={isDisabled || !stake}
          aria-label="Predict price goes UP"
        >
          <span className="prediction-card__button-arrow">↑</span>
          <span className="prediction-card__button-text">UP</span>
        </button>

        <button
          className={`prediction-card__button prediction-card__button--down ${
            selectedDirection === "DOWN" ? "prediction-card__button--active" : ""
          }`}
          onClick={() => handlePrediction("DOWN")}
          disabled={isDisabled || !stake}
          aria-label="Predict price goes DOWN"
        >
          <span className="prediction-card__button-arrow">↓</span>
          <span className="prediction-card__button-text">DOWN</span>
        </button>
      </div>

      <div className="prediction-card__stake-section">
        <label htmlFor="stake-input" className="prediction-card__label">
          Stake Amount
        </label>
        <div className="prediction-card__input-group">
          <input
            id="stake-input"
            type="number"
            className="prediction-card__input"
            placeholder="Enter stake amount"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            disabled={isDisabled}
            min="0"
            step="0.01"
          />
          <button
            className="prediction-card__fill-button"
            onClick={handleFillClick}
            disabled={isDisabled}
            title="Fill with wallet balance"
          >
            Fill
          </button>
        </div>
      </div>

      <div className="prediction-card__toggle-section">
        <label className="prediction-card__toggle">
          <input
            type="checkbox"
            className="prediction-card__toggle-input"
            checked={isLegend}
            onChange={(e) => setIsLegend(e.target.checked)}
            disabled={isDisabled}
          />
          <span className="prediction-card__toggle-label">I am a legend</span>
        </label>
      </div>

      {isLegend && (
        <div className="prediction-card__exact-price-section">
          <label htmlFor="exact-price-input" className="prediction-card__label">
            Exact Price Prediction
          </label>
          <input
            id="exact-price-input"
            type="number"
            className="prediction-card__input"
            placeholder="Enter exact price"
            value={exactPrice}
            onChange={(e) => setExactPrice(e.target.value)}
            disabled={isDisabled}
            step="0.01"
            min="0"
          />
          <p className="prediction-card__legend-hint">
            Predict the exact price for a chance to win the legend bonus!
          </p>
        </div>
      )}

      {isDisabled && (
        <div className="prediction-card__disabled-message">
          {!isWalletConnected && <p>Connect your wallet to make predictions</p>}
          {isWalletConnected && !isRoundActive && <p>This round is not active</p>}
        </div>
      )}
    </div>
  );
};

export default PredictionCard;
