import { Layout } from "~/components/shared/Layout";
import { getServerAuthSession } from "~/server/auth";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { db } from "~/server/db";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { api } from "~/utils/api";
import { ToggleSwitch } from "~/components/ToggleSwitch";
import { useRouter } from "next/router";
import { twMerge } from "tailwind-merge";

const DeleteAccountDialog: React.FC<{
  show: boolean;
  setState: Dispatch<SetStateAction<boolean>>;
}> = ({ show, setState }) => {
  const deleteAccountMutation = api.settings.deleteAccount.useMutation();
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="w-1/3 rounded-lg bg-spotify-grey-800 p-6">
        <h2 className="mb-2 font-circular-title text-2xl text-white">
          Are you sure?
        </h2>
        <p className="text-white">
          Are you absolutely certain? This is your final chance to turn back.
          Once you hit &quot;Delete Account&quot;, your account will be gone for
          good. No takebacks! If you&apos;re ready for a fresh start, go ahead
          and take the leap.
        </p>
        <div className="mt-10 flex items-center justify-between">
          <button
            className={twMerge(
              "rounded-md  px-4 py-2 text-white ",
              enabled
                ? "bg-red-600 hover:bg-red-700"
                : "cursor-not-allowed bg-gray-500",
            )}
            disabled={!enabled}
            onClick={async () => {
              // Disable the button to prevent multiple clicks
              setEnabled(false);

              // Delete the account
              deleteAccountMutation.mutate();

              // Wait 5 seconds before redirecting to the homepage
              await new Promise((resolve) => setTimeout(resolve, 5000));

              // Redirect to the homepage
              await router.push("/");
            }}
          >
            {enabled ? "Delete Account" : "Please Wait..."}
          </button>
          <button
            className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            onClick={() => {
              // Cancel the dialog
              setState(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Settings(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const toggleMutation = api.settings.toggleSetting.useMutation();
  const [settings, setSettings] = useState(props.settings);
  const [canDelete, setCanDelete] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [delCheck1, setDelCheck1] = useState(false);
  const [delCheck2, setDelCheck2] = useState(false);
  const [delCheck3, setDelCheck3] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (timeLeft > 1) {
        setTimeLeft(timeLeft - 1);
      } else {
        setCanDelete(true);

        // Stop the timer
        clearTimeout(timer);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <>
      <DeleteAccountDialog
        show={showDeleteConfirmation}
        setState={setShowDeleteConfirmation}
      />
      <Layout
        head={{
          title: "Settings",
        }}
      >
        <div className="h-full w-full bg-spotify-black p-2 pl-1">
          <div className="flex h-full w-full rounded-lg bg-spotify-grey-900 p-6">
            <div className="m-auto flex h-full w-full flex-col px-6">
              <div className="flex items-center justify-between">
                <h1 className="font-circular-title text-4xl text-white">
                  Settings
                </h1>
              </div>
              <div className="mt-8">
                <h2 className="mb-4 font-circular-title text-2xl text-white">
                  Backup
                </h2>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-white">Weekly Backup</p>
                  <ToggleSwitch
                    checked={settings.weeklyBackup}
                    onChange={async () => {
                      setSettings({
                        ...settings,
                        weeklyBackup: !settings.weeklyBackup,
                      });
                      await toggleMutation.mutateAsync("weeklyBackup");
                    }}
                  />
                </div>
              </div>
              <hr className="mt-5 opacity-10" />
              <div className="mt-8">
                <h2 className="mb-4 font-circular-title text-2xl text-white">
                  Playlist
                </h2>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-white">Automatic Sync to Playlist</p>
                  <ToggleSwitch
                    checked={settings.automaticSyncToPlaylist}
                    onChange={async () => {
                      setSettings({
                        ...settings,
                        automaticSyncToPlaylist:
                          !settings.automaticSyncToPlaylist,
                      });
                      await toggleMutation.mutateAsync(
                        "automaticSyncToPlaylist",
                      );
                    }}
                  />
                </div>
              </div>
              <hr className="mt-5 opacity-10" />
              <div className="mt-8">
                <h2 className="mb-4 font-circular-title text-2xl text-white">
                  Danger Zone
                </h2>

                <label className="flex items-center justify-between pb-3">
                  <p className="text-white">
                    I understand this will{" "}
                    <span className="font-circular-title">PERMANENTLY</span>{" "}
                    erase all data.
                  </p>
                  <ToggleSwitch
                    checked={delCheck1}
                    onChange={() => {
                      setDelCheck1((prev) => !prev);
                    }}
                  />
                </label>
                <label className="flex items-center justify-between pb-3">
                  <p className="text-white">
                    I understand that this action is irreversible.
                  </p>
                  <ToggleSwitch
                    checked={delCheck2}
                    onChange={() => {
                      setDelCheck2((prev) => !prev);
                    }}
                  />
                </label>
                <label className="flex items-center justify-between pb-3">
                  <p className="text-white">Goodbye all previous backups. 😢</p>
                  <ToggleSwitch
                    checked={delCheck3}
                    onChange={() => {
                      setDelCheck3((prev) => !prev);
                    }}
                  />
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Delete Account</span>
                <button
                  className={`rounded-md px-4 py-2 text-white ${
                    canDelete && delCheck1 && delCheck2 && delCheck3
                      ? "bg-red-600 hover:bg-red-700"
                      : "cursor-not-allowed bg-gray-500"
                  }`}
                  disabled={
                    !canDelete || !(delCheck1 && delCheck2 && delCheck3)
                  }
                  onClick={async () => {
                    // Show the user a confirmation dialog
                    setShowDeleteConfirmation(true);
                  }}
                >
                  {canDelete ? "Delete Account" : `Please Wait (${timeLeft}s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps = (async (ctx) => {
  const _session = await getServerAuthSession(ctx);

  if (!_session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    } as const;
  }

  // Get their settings
  let settings = await db.userSettings.findFirst({
    where: { userId: _session.user.id },
  });

  if (!settings) {
    settings = await db.userSettings.create({
      data: {
        userId: _session.user.id,
      },
    });
  }

  return {
    props: {
      settings,
      user: {
        ..._session.user,
      },
    },
  };
}) satisfies GetServerSideProps;
