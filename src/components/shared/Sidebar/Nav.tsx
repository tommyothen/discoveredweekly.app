import { type LucideIcon, Home, Settings, User } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/router";

const SidebarNavOption: React.FC<{
  Icon: LucideIcon;
  title: string;
  href: string;
}> = ({ Icon, title, href }) => {
  const router = useRouter();

  const selected = router.pathname === href;

  return (
    <a
      href={href}
      className={twMerge(
        "flex items-center space-x-6 py-4 px-6",
        selected ? "text-white" : "text-gray-400",
        "hover:text-white",
      )}
    >
      <Icon size={24} strokeWidth={selected ? 2 : 2} />
      <span className={selected ? "font-bold" : ""}>{title}</span>
    </a>
  );
};

export const SidebarNav: React.FC = () => {
  return (
    <div className="row-start-1 row-end-1">
      <div className="bg-spotify-grey-900 flex h-full flex-col rounded-lg">
        <SidebarNavOption Icon={Home} title="Home" href="/dashboard" />
        <SidebarNavOption Icon={Settings} title="Settings" href="/settings" />
      </div>
    </div>
  );
};
