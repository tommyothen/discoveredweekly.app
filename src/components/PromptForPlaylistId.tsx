import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { api } from "~/utils/api";

interface PromptForPlaylistIdProps {
  open: boolean;
}

export const PromptForPlaylistId: React.FC<PromptForPlaylistIdProps> = ({
  open,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [manualOptionState, setManualOptionState] = useState<
    "idle" | "working" | "error" | "success"
  >("idle");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const reasonRef = useRef<HTMLParagraphElement>(null);
  const validatePlaylistMutation = api.spotify.validatePlaylist.useMutation();
  const saveDbPlaylistIdMutation = api.spotify.saveDbPlaylistId.useMutation();
  const triggerBackupMutation = api.spotify.triggerBackup.useMutation();

  if (!open) {
    return null;
  }

  const handlePlaylistUrlChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // If we're working on validating the playlist, don't allow the user to
    // change the input
    if (manualOptionState === "working") {
      return;
    }

    const inputPlaylistUrl = event.target.value;
    setPlaylistUrl(inputPlaylistUrl);

    if (inputPlaylistUrl === "") {
      setManualOptionState("idle");
      return;
    }

    // Validate the playlist URL with zod making sure it's a valid URL and
    // it follows the Spotify playlist URL format
    // https://open.spotify.com/playlist/37i9dQZEVXcLuUe3HopKUJ?si=86b6841f6da945e6
    const playlistUrlSchema = z
      .string()
      .url()
      .regex(/open\.spotify\.com\/playlist/);

    try {
      playlistUrlSchema.parse(inputPlaylistUrl);
      setManualOptionState("working");

      const url = new URL(inputPlaylistUrl);
      const playlistId = url.pathname.split("/")[2];

      if (playlistId === undefined) {
        setManualOptionState("error");
        return;
      }

      const { isValid, message } = await validatePlaylistMutation.mutateAsync({
        playlistId,
      });

      if (isValid) {
        // Playlist is valid, perform necessary actions (e.g., save the playlist ID)
        console.log("Playlist is valid");
        setManualOptionState("success");

        setIsRefreshing(true);

        await saveDbPlaylistIdMutation.mutateAsync({ playlistId });
        await triggerBackupMutation.mutateAsync();

        location.reload();
      } else {
        setManualOptionState("error");
        // Set the error message to the user
        if (reasonRef.current) {
          reasonRef.current.textContent = message;
        }

        console.error(message);
      }
    } catch (error) {
      console.error(error);
      setManualOptionState("error");
      // Set the error message to the user
      if (reasonRef.current) {
        reasonRef.current.textContent = "Invalid playlist URL";
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-75"></div>
      <div className="relative w-full max-w-2xl rounded-lg bg-spotify-grey-800 p-8 text-white shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">
          Discover Weekly Playlist Not Found
        </h2>
        <p className="mb-6">
          We tried to find your Discover Weekly playlist provided by Spotify,
          but unfortunately, we couldn&apos;t locate it. To proceed, please
          follow one of the options below:
        </p>
        <div className="mb-8">
          <h3 className="mb-2 text-lg font-semibold">
            Option 1: Manually share the playlist URL
          </h3>
          <ol className="mb-4 list-inside list-decimal">
            <li>Open the Discover Weekly playlist on Spotify.</li>
            <li>Click on the &quot;Share&quot; button.</li>
            <li>Copy the playlist URL.</li>
            <li>Paste the URL in the input field below.</li>
          </ol>
          <input
            type="text"
            className={twMerge(
              "w-full rounded bg-spotify-grey-700 px-4 py-2",
              manualOptionState === "working" &&
                "cursor-not-allowed border border-gray-500",
              manualOptionState === "error" && "border border-red-500",
              manualOptionState === "success" && "border border-green-500",
            )}
            placeholder="Paste the Discover Weekly playlist URL here"
            value={playlistUrl}
            onChange={handlePlaylistUrlChange}
            disabled={
              manualOptionState === "working" || manualOptionState === "success"
            }
          />
          <p
            ref={reasonRef}
            className={twMerge(
              "text-red-500",
              manualOptionState === "idle" || manualOptionState === "success"
                ? "opacity-0"
                : "opacity-100",
            )}
          />
        </div>
        <div className="mb-8">
          <h3 className="mb-2 text-lg font-semibold">
            Option 2: Like the Discover Weekly playlist on Spotify
          </h3>
          <ol className="mb-4 list-inside list-decimal">
            <li>Open the Discover Weekly playlist on Spotify.</li>
            <li>
              Click on the &quot;Like&quot; button to add the playlist to your
              library.
            </li>
            <li>Press the &quot;Refresh&quot; button below.</li>
          </ol>
        </div>
        <button
          className={twMerge(
            "rounded-full px-6 py-3 font-semibold text-white transition duration-300",
            isRefreshing
              ? "bg-spotify-grey-700"
              : "bg-spotify-green hover:bg-spotify-green-dark",
          )}
          onClick={() => {
            setIsRefreshing(true);

            location.reload();
          }}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
};
