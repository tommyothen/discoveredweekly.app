import { DatabaseBackup } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export const Countdown: React.FC = () => {
  const [countdown, setCountdown] = useState<string>("");

  const getNextTuesday = useMemo(() => {
    const now = new Date();
    const daysUntilNextTuesday = (2 + 7 - now.getUTCDay()) % 7;
    const nextTuesday = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + daysUntilNextTuesday,
        12,
        0,
        0,
        0,
      ),
    );
    return nextTuesday;
  }, []);

  const formatCountdown = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    const format = (value: number, unit: string, showUnit: boolean): string => {
      if (value === 0 && !showUnit) return "";
      if (value === 0 && showUnit) return `0${unit} `;
      if (unit === "d") return `${value}d `;
      return `${value.toString().padStart(2, "0")}${unit} `;
    };

    return (
      `${format(days, "d", days !== 0)}` +
      `${format(hours, "h", days > 0)}` +
      `${format(minutes, "m", days > 0 || hours > 0)}` +
      `${format(seconds, "s", days > 0 || hours > 0 || minutes > 0)}`
    ).trim();
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const timeDifference = getNextTuesday.getTime() - now.getTime();

      const isTuesdayBackupTime =
        now.getUTCDay() === 2 &&
        now.getUTCHours() >= 12 &&
        now.getUTCHours() < 13;

      if (isTuesdayBackupTime) {
        setCountdown("Backup in progress...");
      } else if (timeDifference <= 0) {
        const newNextTuesday = new Date(
          getNextTuesday.getTime() + 7 * 24 * 60 * 60 * 1000,
        );
        setCountdown(
          `Next: ${formatCountdown(newNextTuesday.getTime() - now.getTime())}`,
        );
      } else {
        setCountdown(`Next: ${formatCountdown(timeDifference)}`);
      }
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [formatCountdown, getNextTuesday]);

  return (
    <div className="group relative flex items-center gap-2 rounded-lg bg-spotify-grey-900 px-4 py-2 text-sm text-white text-opacity-30">
      <DatabaseBackup size={24} />
      <span className="text-lg font-light">{countdown}</span>
      <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform opacity-0 transition-opacity group-hover:opacity-100">
        <div className="rounded-lg bg-black p-2 text-sm text-white shadow-lg">
          An automated backup is taken every Tuesday at 12:00 PM UTC
        </div>
        <div className="absolute left-1/2 top-full -translate-x-1/2 transform border-4 border-transparent border-t-black"></div>
      </div>
    </div>
  );
};
