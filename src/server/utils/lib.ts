import { env } from "~/env";
import { db } from "~/server/db";
import { SpotifyAPI, type TrackObject } from "~/utils/SpotifyAPI";
import { getImageColours } from "~/utils/lib";

export async function getDiscoverWeeklyPlaylistId(
  userId: string,
  token: string,
): Promise<string | null> {
  try {
    const spotifyPlaylists = await db.userSpotifyPlaylistIds.findFirst({
      where: { userId },
    });

    if (spotifyPlaylists !== null) {
      return spotifyPlaylists.discoverWeeklyId;
    }

    const playlistsResponse = await SpotifyAPI.me.playlists.query(token, {
      limit: 50,
    });

    if (playlistsResponse === undefined || playlistsResponse.status !== 200) {
      throw new Error(`Error fetching playlists: ${playlistsResponse?.status}`);
    }

    const discoverWeeklyPlaylist = playlistsResponse.data.items.find(
      (playlist) =>
        playlist.name === "Discover Weekly" && playlist.owner.id === "spotify",
    );

    if (!discoverWeeklyPlaylist) {
      throw new Error("Discover Weekly playlist not found");
    }

    await db.userSpotifyPlaylistIds.create({
      data: {
        userId,
        discoverWeeklyId: discoverWeeklyPlaylist.id,
      },
    });

    return discoverWeeklyPlaylist.id;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function saveTrackAndArtists(track: TrackObject) {
  let colors: Array<string> = [];

  if (track.album.images.length > 0) {
    const image = track.album.images[0]!.url;
    const c = await getImageColours(image);

    colors = c.map((color) => color.hex());
  }

  const spotifyTrack = await db.spotifyTrack.upsert({
    where: { id: track.id },
    update: {},
    create: {
      id: track.id,
      name: track.name,
      uri: track.uri,
      coverArtUrl: track.album.images[0]?.url ?? "",
      colors,
    },
  });

  await Promise.all(
    track.artists.map((artist) =>
      db.spotifyArtist.upsert({
        where: { id: artist.id },
        update: {},
        create: {
          id: artist.id,
          name: artist.name,
          uri: artist.uri,
          imageUrl: "",
        },
      }),
    ),
  );

  await Promise.all(
    track.artists.map((artist) =>
      db.spotifyTrackArtists.upsert({
        where: { trackId_artistId: { trackId: track.id, artistId: artist.id } },
        update: {},
        create: {
          trackId: track.id,
          artistId: artist.id,
        },
      }),
    ),
  );

  return spotifyTrack;
}

export async function refreshAccessToken(
  providerAccountId: string,
  refreshToken: string,
) {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: env.SPOTIFY_CLIENT_ID,
        client_secret: env.SPOTIFY_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error refreshing access token: ${response.status}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
    };
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;

    // Update the refresh token and access token in the database
    await db.account.update({
      where: {
        provider_providerAccountId: {
          provider: "spotify",
          providerAccountId,
        },
      },
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

export async function getSettings(userId: string) {
  let settings = await db.userSettings.findFirst({
    where: { userId },
  });

  // If it's null we create a new settings object
  if (!settings) {
    settings = await db.userSettings.create({
      data: { userId },
    });
  }

  return settings;
}
