import { SidebarLibrary } from "~/components/shared/Sidebar/Library";
import { SidebarNav } from "~/components/shared/Sidebar/Nav";
import { Countdown } from "~/components/shared/Sidebar/Countdown";

export const Sidebar: React.FC = () => {
  return (
    <div className="bg-spotify-black grid h-full w-full select-none grid-cols-1 grid-rows-[auto_1fr_auto] gap-2 p-2 pr-1">
      <SidebarNav />
      <SidebarLibrary />
      <Countdown />
    </div>
  );
};
