import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  AreaSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

interface PricePoint {
  time: number;
  value: number;
}

// Dummy data for XLM/USD price
const dummyData: PricePoint[] = [
  { time: 1738000000, value: 0.2285 },
  { time: 1738003600, value: 0.2291 },
  { time: 1738007200, value: 0.2278 },
  { time: 1738010800, value: 0.2264 },
  { time: 1738014400, value: 0.225 },
  { time: 1738018000, value: 0.2235 },
  { time: 1738021600, value: 0.222 },
  { time: 1738025200, value: 0.221 },
  { time: 1738028800, value: 0.2195 },
  { time: 1738032400, value: 0.2182 },
  { time: 1738036000, value: 0.2175 },
  { time: 1738039600, value: 0.2168 },
  { time: 1738043200, value: 0.2155 },
  { time: 1738046800, value: 0.214 },
  { time: 1738050400, value: 0.2128 },
  { time: 1738054000, value: 0.2115 },
  { time: 1738057600, value: 0.2174 },
  { time: 1738061200, value: 0.217 },
  { time: 1738064800, value: 0.2168 },
  { time: 1738068400, value: 0.2165 },
  { time: Math.floor(Date.now() / 1000), value: 0.2084 },
];

interface PriceChartProps {
  data?: PricePoint[];
  height?: number;
}

const PriceChart = ({ data = dummyData, height = 300 }: PriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "rgba(156, 163, 175, 0.1)" },
        horzLines: { color: "rgba(156, 163, 175, 0.1)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      rightPriceScale: {
        borderColor: "rgba(156, 163, 175, 0.2)",
      },
      timeScale: {
        borderColor: "rgba(156, 163, 175, 0.2)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: "#2C4BFD",
          width: 1,
          style: 3,
          labelBackgroundColor: "#2C4BFD",
        },
        horzLine: {
          color: "#2C4BFD",
          width: 1,
          style: 3,
          labelBackgroundColor: "#2C4BFD",
        },
      },
    });

    chartRef.current = chart;

    // Create area series with gradient (v5 API)
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "#2C4BFD",
      topColor: "rgba(44, 75, 253, 0.4)",
      bottomColor: "rgba(44, 75, 253, 0.0)",
      lineWidth: 2,
      priceFormat: {
        type: "price",
        precision: 4,
        minMove: 0.0001,
      },
    });
    seriesRef.current = areaSeries;

    // Set data
    areaSeries.setData(data as any);

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height]);

  // Get latest price for display
  const latestPrice = data[data.length - 1]?.value ?? 0;
  const previousPrice = data[data.length - 2]?.value ?? latestPrice;
  const priceChange = latestPrice - previousPrice;
  const priceChangePercent =
    previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2C4BFD] to-[#1E3FD4] flex items-center justify-center">
              <span className="text-white text-xs font-bold">XLM</span>
            </div>
            <div>
              <span className="font-bold text-[#292D32] dark:text-white text-lg">
                XLM/USD
              </span>
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                LIVE
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-[#292D32] dark:text-white text-xl tabular-nums">
            ${latestPrice.toFixed(4)}
          </p>
          <p
            className={`text-sm font-semibold tabular-nums ${isPositive ? "text-green-500" : "text-red-500"}`}
          >
            {isPositive ? "+" : ""}
            {priceChange.toFixed(4)} ({isPositive ? "+" : ""}
            {priceChangePercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={chartContainerRef}
        className="w-full flex-1 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50"
      />

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 px-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Last update: {new Date().toLocaleTimeString()}</span>
        <span>Live simulation</span>
      </div>
    </div>
  );
};

export default PriceChart;
