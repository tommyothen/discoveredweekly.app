import React, { forwardRef } from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

export const ToggleSwitch: React.ForwardRefRenderFunction<
  HTMLDivElement,
  ToggleSwitchProps
> = ({ checked, onChange }) => {
  return (
    <div
      className={`h-6 w-12 cursor-pointer rounded-full p-1 transition-colors duration-300 ${
        checked ? "bg-spotify-green" : "bg-spotify-grey-800"
      }`}
      onClick={onChange}
    >
      <div
        className={`h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
          checked ? "translate-x-6" : ""
        }`}
      ></div>
    </div>
  );
};

export const ForwardedToggleSwitch = forwardRef(ToggleSwitch);
