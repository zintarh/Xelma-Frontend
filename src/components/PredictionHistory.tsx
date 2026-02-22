import { useCallback, useEffect, useState } from "react";
import { predictionsApi, type UserPrediction } from "../lib/api-client";

interface PredictionHistoryProps {
  userId: string | null;
}

function formatDate(value?: string): string {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}

function formatStake(value?: string | number): string {
  if (value === undefined || value === null || value === "") return "N/A";
  if (typeof value === "number") return value.toString();
  return value;
}

export default function PredictionHistory({ userId }: PredictionHistoryProps) {
  const [history, setHistory] = useState<UserPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!userId) {
      setHistory([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const predictions = await predictionsApi.getUserHistory(userId);
      setHistory(predictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prediction history");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <section className="bg-white dark:bg-gray-800 p-6 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Prediction History</h3>
        {userId && (
          <button
            type="button"
            className="text-sm font-medium text-[#2C4BFD] hover:underline"
            onClick={() => void loadHistory()}
          >
            Refresh
          </button>
        )}
      </div>

      {!userId && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Connect your wallet to view your prediction history.
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-gray-600 dark:text-gray-300" role="status">
          Loading prediction history...
        </p>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            type="button"
            className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:underline"
            onClick={() => void loadHistory()}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && userId && history.length === 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-300">No predictions yet.</p>
      )}

      {!isLoading && !error && history.length > 0 && (
        <ul className="space-y-3">
          {history.map((prediction, index) => {
            const direction = typeof prediction.direction === "string" ? prediction.direction : "UNKNOWN";
            const exactPrice =
              prediction.exactPrice === undefined || prediction.exactPrice === null
                ? null
                : String(prediction.exactPrice);
            const status = typeof prediction.status === "string" ? prediction.status : null;
            const roundId =
              prediction.roundId === undefined || prediction.roundId === null
                ? null
                : String(prediction.roundId);
            const key =
              `${String(prediction.id)}-${index}`;

            return (
              <li
                key={key}
                className="rounded-lg border border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <span className={direction === "UP" ? "text-green-600" : "text-pink-600"}>{direction}</span>
                    {" "}
                    • Stake: {formatStake(prediction.stake)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(typeof prediction.createdAt === "string" ? prediction.createdAt : undefined)}
                  </p>
                </div>

                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
                  {roundId && <span>Round: {roundId}</span>}
                  {exactPrice && <span>Exact price: {exactPrice}</span>}
                  {status && <span>Status: {status}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
