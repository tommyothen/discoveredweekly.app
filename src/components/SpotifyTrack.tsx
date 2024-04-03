import Image from "next/image";
import { hexToRGBA } from "~/utils/lib";

interface Artist {
  id: string;
  name: string;
}

interface SpotifyTrackArtist {
  artist: Artist;
}

interface Track {
  id: string;
  name: string;
  coverArtUrl: string;
  uri: string;
  colors: string[];
  SpotifyTrackArtists: SpotifyTrackArtist[];
}

interface SpotifyTrackProps {
  track: Track;
}

const SpotifyTrack: React.FC<SpotifyTrackProps> = ({ track }) => {
  const { name, coverArtUrl, uri, SpotifyTrackArtists } = track;
  const artistNames = SpotifyTrackArtists.map(
    (trackArtist) => trackArtist.artist.name,
  );

  return (
    <div className="flex h-full flex-col items-center space-y-2 rounded-lg bg-spotify-grey-800 bg-opacity-50 p-4 shadow-md hover:bg-opacity-100">
      <div className="relative h-0 w-full pb-[100%]">
        <Image
          src={coverArtUrl}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="rounded-lg shadow-md"
          onMouseEnter={() => {
            // Get the new colour it should be
            const newColor = hexToRGBA(track.colors[0]);

            // Set the css --backup-top-color variable in :root
            document.documentElement.style.setProperty(
              "--backup-top-color",
              newColor,
            );
          }}
        />
      </div>
      <div className="mt-4 flex flex-grow flex-col">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="text-spotify-grey-300 pb-2 text-sm">
            {artistNames.join(", ")}
          </p>
        </div>
        <div className="mt-auto text-center">
          <a
            href={uri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-spotify-green hover:underline"
          >
            Listen on Spotify
          </a>
        </div>
      </div>
    </div>
  );
};

export default SpotifyTrack;
