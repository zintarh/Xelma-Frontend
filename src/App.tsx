import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from './components/ThemeProvider'
import "./App.css";
import Header from "./components/Header";
import Leaderboard from "./components/Leaderboard";
import RouteProgressBar from "./components/RouteProgressBar";
import PredictionCard from "./components/PredictionCard";

function App() {
  const handlePrediction = (data: any) => {
    console.log("Prediction made:", data);
  };

  return (
    <ThemeProvider>
      <RouteProgressBar />
      <Header />
      <main className="pt-24 lg:pt-32 px-4 lg:px-14 min-h-screen bg-[#FAFAFA] dark:bg-gray-900">
        <Routes>
          <Route
            path="/"
            element={
              <div className="mt-40 pb-20">
                <PredictionCard
                  isWalletConnected={true}
                  isRoundActive={true}
                  onPrediction={handlePrediction}
                />
              </div>
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/learn"
            element={
              <div className="text-center mt-20 text-2xl font-bold text-[#9B9B9B]">
                Learn Page Placeholder
              </div>
            }
          />
          <Route
            path="/pools"
            element={
              <div className="text-center mt-20 text-2xl font-bold text-[#9B9B9B]">
                Pools Page Placeholder
              </div>
            }
          />
        </Routes>
      </main>
    </ThemeProvider>
  );
}

export default App;
