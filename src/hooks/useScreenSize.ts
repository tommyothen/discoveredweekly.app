import { useState, useEffect } from "react";

type ScreenSize = "2xl" | "xl" | "lg" | "md" | "sm" | "xs";

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<ScreenSize | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1536) {
        setScreenSize("2xl");
      } else if (width >= 1280) {
        setScreenSize("xl");
      } else if (width >= 1024) {
        setScreenSize("lg");
      } else if (width >= 768) {
        setScreenSize("md");
      } else if (width >= 640) {
        setScreenSize("sm");
      } else {
        setScreenSize("xs");
      }
    };

    handleResize(); // Check on initial render

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return screenSize;
};
