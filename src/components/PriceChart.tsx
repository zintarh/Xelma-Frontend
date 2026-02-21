import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

interface PricePoint {
  time: number;
  value: number;
}

const dummyData: PricePoint[] = [
  { time: 1738000000, value: 138.974296 },
  { time: 1738001800, value: 138.972 },
  { time: 1738003600, value: 138.968 },
  { time: 1738005400, value: 138.970 },
  { time: 1738007200, value: 138.966 },
  { time: 1738009000, value: 138.962 },
  { time: 1738010800, value: 138.956339 },
  { time: 1738014400, value: 138.945 },
  { time: 1738018000, value: 138.930 },
  { time: 1738021600, value: 138.910 },
  { time: 1738025200, value: 138.893 },
  { time: 1738028800, value: 138.881339 },
  { time: 1738032400, value: 138.890 },
  { time: 1738036000, value: 138.903 },
  { time: 1738039600, value: 138.911339 },
  { time: 1738043200, value: 138.918 },
  { time: 1738046800, value: 138.922 },
  { time: 1738050400, value: 138.926339 },
  { time: 1738054000, value: 138.915 },
  { time: 1738057600, value: 138.903 },
  { time: 1738061200, value: 138.893 },
  { time: 1738064800, value: 138.885 },
  { time: 1738068400, value: 138.881339 },
  { time: 1738072000, value: 138.888 },
  { time: 1738075600, value: 138.895 },
  { time: 1738079200, value: 138.900156 },
];

// Price levels shown on the right axis (matching the reference image)
const PRICE_LABELS = [
  138.974296, 138.956339, 138.941339, 138.926339, 138.911339, 138.881339,
];

interface PriceChartProps {
  data?: PricePoint[];
  height?: number;
}

const PriceChart = ({ data = dummyData, height = 300 }: PriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  // y-coordinate of the last data point for the badge
  const [badgeY, setBadgeY] = useState<number | null>(null);
  // y-coordinates for each price label
  const [labelYs, setLabelYs] = useState<number[]>([]);

  const latestPrice = data[data.length - 1]?.value ?? 0;
  const firstPrice = data[0]?.value ?? latestPrice;
  const priceChange = latestPrice - firstPrice;
  const priceChangePercent = firstPrice !== 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "transparent", // hide built-in labels
        fontFamily: "inherit",
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      width: container.clientWidth,
      height: height,
      rightPriceScale: {
        visible: false, // hide the built-in price scale entirely
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
        borderVisible: false,
        rightOffset: 0,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#FFFFFF",
      lineWidth: 3,
      priceFormat: { type: "price", precision: 6, minMove: 0.000001 },
      lastValueVisible: false,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      lineType: 2, // LineType.Curved
    });

    seriesRef.current = lineSeries;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lineSeries.setData(data as any);
    chart.timeScale().fitContent();

    const updatePositions = () => {
      if (!seriesRef.current) return;
      const lastPoint = data[data.length - 1];
      if (!lastPoint) return;

      const y = seriesRef.current.priceToCoordinate(lastPoint.value);
      if (y !== null) setBadgeY(y);

      const ys = PRICE_LABELS.map((p) => seriesRef.current!.priceToCoordinate(p));
      setLabelYs(ys.map((v) => v ?? -9999));
    };

    requestAnimationFrame(updatePositions);
    chart.timeScale().subscribeVisibleLogicalRangeChange(updatePositions);

    const handleResize = () => {
      chart.applyOptions({ width: container.clientWidth });
      requestAnimationFrame(updatePositions);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1e3a5f, #0a1929)" }}
          >
            <span className="text-white text-xs font-bold">XLM</span>
          </div>
          <div>
            <span className="font-bold text-[#292D32] dark:text-white text-lg">XLM/USD</span>
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">LIVE</span>
          </div>
        </div>
        <p className={`text-sm font-semibold tabular-nums ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{priceChangePercent.toFixed(2)}%
        </p>
      </div>

      {/* Chart area wrapper with padded border — azul marino */}
      <div className="relative w-full flex-1 rounded-2xl border-[3px] border-[#1e3a5f]" style={{ minHeight: height, background: "linear-gradient(180deg, #1e3a5f 0%, #13274F 50%, #0a1929 100%)" }}>
        
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner">
          {/* Montañas (imagen de fondo) */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: "url('/chart-bg.png')",
              backgroundPosition: "center 38%",
            }}
          />
          {/* Overlay azul marino suave para que se vean más las montañas */}
          <div
            className="absolute inset-0"
            style={{ 
              background: "linear-gradient(180deg, rgba(30, 58, 95, 0.45) 0%, rgba(19, 39, 79, 0.5) 50%, rgba(10, 25, 41, 0.55) 100%)",
            }}
          />
        {/* Chart — leaves space on the right so line terminates exactly at the badge */}
        <div ref={chartContainerRef} className="absolute inset-y-0 left-0 right-[105px]" />

        {/* Custom price labels on the right */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-[105px] flex flex-col">
          {PRICE_LABELS.map((price, i) => {
            const y = labelYs[i];
            if (y === undefined || y < 0 || y > height) return null;
            const isBadgePrice = Math.abs(price - latestPrice) < 0.001;
            return (
              <div
                key={price}
                className="absolute right-2 tabular-nums whitespace-nowrap"
                style={{
                  top: y,
                  transform: "translateY(-50%)",
                  fontSize: "11px",
                  color: isBadgePrice ? "#fff" : "rgba(255,255,255,0.9)",
                  fontWeight: isBadgePrice ? "700" : "500",
                }}
              >
                {price.toFixed(6)}
              </div>
            );
          })}
        </div>

        {/* Price dot and badge at the last point exactly on the boundary */}
        {badgeY !== null && (
          <div
            className="pointer-events-none absolute z-20 flex items-center transition-all duration-300"
            style={{
              right: "4px",
              width: "101px",
              top: badgeY,
              transform: "translateY(calc(-50% + 3px)) scale(0.96)",
              transformOrigin: "left center",
            }}
          >
            {/* Connecting dot exactly at the chart's right edge */}
            <div 
              className="w-2.5 h-2.5 bg-white rounded-full absolute shadow-[0_0_8px_rgba(255,255,255,0.8)]" 
              style={{ left: "-5px" }} 
            />
            {/* The badge box */}
            <div
              className="font-bold text-xs px-2 py-1 rounded shadow-sm tabular-nums whitespace-nowrap relative"
              style={{
                background: "rgba(255,255,255,0.98)",
                color: "#0a1929",
                marginLeft: "8px",
              }}
            >
              ${latestPrice.toFixed(6)}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 px-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Last update: {new Date().toLocaleTimeString()}</span>
        <span>Live simulation</span>
      </div>
    </div>
  );
};

export default PriceChart;
