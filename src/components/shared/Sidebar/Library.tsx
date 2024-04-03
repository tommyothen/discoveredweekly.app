import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { generateGradient } from "~/utils/lib";
import { MusicIcon } from "lucide-react";

const Backup: React.FC<{
  backup: {
    backupId: string;
    year: number;
    week: number;
    createdAt: Date;
    userId: string;
  };
}> = ({ backup }) => {
  const { backupId } = backup;
  const gradient = generateGradient(backupId);
  const router = useRouter();

  return (
    <div
      className="flex cursor-pointer items-center justify-between p-2"
      onClick={async () => {
        await router.push(`/b/${backupId}`);
      }}
    >
      <div className="flex w-full items-center gap-4 rounded-lg p-2 hover:bg-spotify-grey-800">
        {/* Generated Logo for the backup */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ background: gradient }}
        >
          <MusicIcon size={32} color="white" opacity="80%" />
        </div>
        <div className="text-white">
          <p className="text-xl font-circular-title text-white text-opacity-95">
            {backup.year} Week {backup.week}
          </p>
          <p className="text-white text-sm text-opacity-35">
            {backup.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const RenderBackups: React.FC<{
  backups:
    | {
        backupId: string;
        year: number;
        week: number;
        createdAt: Date;
        userId: string;
      }[]
    | undefined;
}> = ({ backups }) => {
  if (backups === undefined)
    return (
      <div className="w-full py-4 text-center">
        <p className="w-full text-white">Loading...</p>;
      </div>
    );

  return (
    <div className="h-full w-full">
      {backups.map((backup) => (
        <Backup key={backup.backupId} backup={backup} />
      ))}
    </div>
  );
};

export const SidebarLibrary: React.FC = () => {
  const { data: backupData } = api.backups.getMyBackups.useQuery();

  return (
    <div className="row-start-2 row-end-3 h-full">
      <div className="flex h-full flex-col rounded-lg bg-spotify-grey-900">
        <RenderBackups backups={backupData} />
      </div>
    </div>
  );
};
