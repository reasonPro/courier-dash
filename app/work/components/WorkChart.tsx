import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import type { WorkTranslations } from "../work-page.types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend
);

type WorkChartProps = {
  data: any;
  isNetto: boolean;
  options: any;
  translations: WorkTranslations;
};

export function WorkChart({
  data,
  isNetto,
  options,
  translations: t,
}: WorkChartProps) {
  return (
    <div className="bg-[#1e1e24] p-3 md:p-6 rounded-xl border border-gray-800 mb-8 shadow-sm">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{t.work.chartTitle} {isNetto && <span className="text-blue-400">({t.work.netto})</span>}</h3>
      <div className="w-full overflow-x-auto pb-2">
        <div className="h-64 md:h-72 min-w-[700px] relative">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
