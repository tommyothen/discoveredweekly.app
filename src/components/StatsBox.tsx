import type { LucideIcon } from "lucide-react";
import CountUp from "react-countup";

export const StatsBox: React.FC<{
  Icon: LucideIcon;
  title: string;
  value: string;
  description?: string;
}> = ({ Icon, title, value, description }) => {
  return (
    <div className="bg-spotify-grey-800 flex flex-col items-center justify-center rounded-lg p-6 text-white shadow-md">
      <div className="mb-4">
        <Icon color="#1DB954" size={48} />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-center">{title}</h2>
      <CountUp
        end={parseInt(value)}
        duration={2}
        separator=","
        className="text-spotify-green mb-4 text-5xl font-bold"
      />
      {description && (
        <p className="text-spotify-grey-300 text-center text-lg">
          {description}
        </p>
      )}
    </div>
  );
};
