import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { SpotifyAPI, type TrackObject } from "~/utils/SpotifyAPI";
import type { GetServerSidePropsContext } from "next";
import { getWeekNumber } from "~/utils/lib";
import {
  getDiscoverWeeklyPlaylistId,
  refreshAccessToken,
  saveTrackAndArtists,
} from "~/server/utils/lib";
import type { Session } from "next-auth";
import SuperJSON from "superjson";

async function getDashboardStats(session: Session) {
  const user = session.user;

  const totalBackups = await db.discoveredWeeklyBackup.count({
    where: { userId: user.id },
  });

  const totalTracks = await db.discoveredWeeklyBackupTrack.count({
    where: { backup: { userId: user.id } },
  });

  const totalArtists = await db.spotifyArtist.count({
    where: {
      SpotifyTrackArtists: {
        some: {
          track: { backups: { some: { backup: { userId: user.id } } } },
        },
      },
    },
  });

  const recentBackups = await db.discoveredWeeklyBackup.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      backupId: true,
      year: true,
      week: true,
    },
  });

  let mostFrequentArtists = await db.spotifyArtist.findMany({
    where: {
      SpotifyTrackArtists: {
        some: {
          track: { backups: { some: { backup: { userId: user.id } } } },
        },
      },
    },
    orderBy: {
      SpotifyTrackArtists: {
        _count: "desc",
      },
    },
    take: 5,
    select: {
      id: true,
      name: true,
      imageUrl: true,
      _count: {
        select: {
          SpotifyTrackArtists: true,
        },
      },
    },
  });

  // Actually, to save some resources, we dont call the Spotify API unless we need to
  // so when the artists are first added to the database, we don't have their images
  // so we can fetch them here if we haven't previously fetched them
  const account = await db.account.findFirst({
    where: {
      userId: user.id,
    },
    select: {
      providerAccountId: true,
      refresh_token: true,
    },
  });

  const accessToken = await refreshAccessToken(
    account!.providerAccountId,
    account!.refresh_token!,
  );

  mostFrequentArtists = await Promise.all(
    mostFrequentArtists.map(async (artist) => {
      if (artist.imageUrl === "") {
        const spotifyArtist = await SpotifyAPI.artists._artist.query(
          accessToken,
          {
            artist_id: artist.id,
          },
        );

        if (spotifyArtist === undefined || spotifyArtist.status !== 200) {
          console.error(
            `Error fetching artist: ${spotifyArtist?.status} ${artist.id}`,
          );
          return artist; // Just return the artist without the new image
        }

        const imageUrl = spotifyArtist.data.images[0]?.url ?? "";
        await db.spotifyArtist.update({
          where: { id: artist.id },
          data: { imageUrl },
        });

        return { ...artist, imageUrl };
      }
      return artist;
    }),
  );

  return {
    totalBackups,
    totalTracks,
    totalArtists,
    recentBackups,
    mostFrequentArtists,
  };
}

async function getJoinedAt(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });

  return SuperJSON.serialize(user!.createdAt);
}

export default async function dashboard(ctx: GetServerSidePropsContext) {
  const _session = await getServerAuthSession(ctx);

  if (!_session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    } as const;
  }

  const { user } = _session;

  // Remember to check if we already have saved the playlist id
  const spotifyPlaylists = await db.userSpotifyPlaylistIds.findFirst({
    where: { userId: user.id },
  });

  if (spotifyPlaylists !== null) {
    return {
      props: {
        stats: await getDashboardStats(_session),
        user: {
          ...user,
          joinedAt: await getJoinedAt(user.id),
        },
        promptUser: false,
      },
    } as const;
  }

  // Refresh the access token just in case it's expired
  const account = await db.account.findFirst({
    where: {
      userId: user.id,
    },
    select: {
      providerAccountId: true,
      refresh_token: true,
    },
  });

  if (!account?.refresh_token) {
    console.error("No access token found");
    return {
      props: {
        promptUser: true,
      },
    } as const;
  }

  const accessToken = await refreshAccessToken(
    account.providerAccountId,
    account.refresh_token,
  );

  if (!accessToken) {
    console.error("Error refreshing access token");
    return {
      props: {
        promptUser: true,
      },
    } as const;
  }

  try {
    const discoverWeeklyId = await getDiscoverWeeklyPlaylistId(
      user.id,
      accessToken,
    );

    if (!discoverWeeklyId) {
      return {
        props: {
          promptUser: true,
        },
      } as const;
    }

    const discoverWeeklyItemsResponse = await SpotifyAPI.playlists.tracks.query(
      accessToken,
      {
        playlist_id: discoverWeeklyId,
        limit: 50,
      },
    );

    if (
      discoverWeeklyItemsResponse === undefined ||
      discoverWeeklyItemsResponse.status !== 200
    ) {
      throw new Error(
        `Error fetching playlist items: ${discoverWeeklyItemsResponse?.status}`,
      );
    }

    const playlistTrackObjects = discoverWeeklyItemsResponse.data.items
      .map((item) => {
        if (item.track.type === "track") {
          return item.track;
        }
      })
      .filter((item): item is TrackObject => item !== undefined);

    const backup = await db.discoveredWeeklyBackup.create({
      data: {
        year: new Date().getFullYear(),
        week: getWeekNumber(new Date()),
        userId: user.id,
      },
    });

    await Promise.all(
      playlistTrackObjects.map(async (track) => {
        const spotifyTrack = await saveTrackAndArtists(track);
        await db.discoveredWeeklyBackupTrack.create({
          data: {
            backupId: backup.backupId,
            trackId: spotifyTrack.id,
          },
        });
      }),
    );

    return {
      props: {
        stats: await getDashboardStats(_session),
        user: {
          ...user,
          joinedAt: await getJoinedAt(user.id),
        },
        promptUser: false,
      },
    } as const;
  } catch (error) {
    console.error(error);
    return {
      props: {
        promptUser: true,
      },
    } as const;
  }
}
