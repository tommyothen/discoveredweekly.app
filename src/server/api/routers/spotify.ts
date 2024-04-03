import { z } from "zod";
import { env } from "~/env";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  getDiscoverWeeklyPlaylistId,
  refreshAccessToken,
  saveTrackAndArtists,
} from "~/server/utils/lib";
import { SpotifyAPI, type TrackObject } from "~/utils/SpotifyAPI";
import { getWeekNumber } from "~/utils/lib";

type getDiscoverWeeklyPlaylistIdResult = [boolean, string];

export const spotifyRouter = createTRPCRouter({
  getDiscoverWeeklyPlaylistId: protectedProcedure
    .input(
      z.object({
        from: z.union([z.literal("/me/playlists"), z.literal("/search")]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.account.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });
      if (!account)
        return [
          false,
          "No account found",
        ] as const satisfies getDiscoverWeeklyPlaylistIdResult;

      const token = account.access_token;
      if (!token)
        return [
          false,
          "No access token found",
        ] as const satisfies getDiscoverWeeklyPlaylistIdResult;

      const from = input.from;
      if (from === "/me/playlists") {
        let playlists = await SpotifyAPI.me.playlists.query(token, {
          limit: 50,
        });

        if (playlists === undefined)
          return [
            false,
            "No playlist found",
          ] as const satisfies getDiscoverWeeklyPlaylistIdResult;

        if (playlists.status !== 200)
          return [
            false,
            "Error fetching playlists",
          ] as const satisfies getDiscoverWeeklyPlaylistIdResult;

        // The playlist may not be in the first 50 playlists,
        // so we need to keep fetching until we find it
        while (
          playlists !== undefined &&
          playlists.status === 200 &&
          playlists.data.next !== null
        ) {
          const discoverWeeklyPlaylist = playlists.data.items.find(
            (playlist) =>
              playlist.name === "Discover Weekly" &&
              playlist.owner.id === "spotify",
          );

          if (discoverWeeklyPlaylist) {
            return [
              true,
              discoverWeeklyPlaylist.id,
            ] as const satisfies getDiscoverWeeklyPlaylistIdResult;
          }

          playlists = await SpotifyAPI.me.playlists.query(token, {
            limit: 50,
            offset: playlists.data.offset + playlists.data.limit,
          });
        }

        return [
          false,
          "Discover Weekly playlist not found",
        ] as const satisfies getDiscoverWeeklyPlaylistIdResult;
      } else if (from === "/search") {
        // const search = await SpotifyAPI.search.query(token, {
        //   q: "Discover Weekly",
        //   type: ["playlist"],
        //   limit: 50,
        // });

        return [true, ""] as const satisfies getDiscoverWeeklyPlaylistIdResult;
      }

      return [
        false,
        "Invalid from",
      ] as const satisfies getDiscoverWeeklyPlaylistIdResult;
    }),

  validatePlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { playlistId } = input;

      const account = await ctx.db.account.findFirst({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (!account) return { isValid: false, message: "No account found" };

      const token = account.access_token;

      if (!token) return { isValid: false, message: "No access token found" };

      const playlist = await SpotifyAPI.playlists._playlist.query(token, {
        playlist_id: playlistId,
      });

      console.log(token, {
        playlist_id: playlistId,
      });

      if (playlist === undefined)
        return { isValid: false, message: "No playlist found" };

      if (playlist.status !== 200)
        return { isValid: false, message: "Error fetching playlist" };

      // Check if the playlist is called Discover Weekly and the owner is Spotify
      if (
        playlist.data.name === "Discover Weekly" &&
        playlist.data.owner.id === "spotify"
      )
        return { isValid: true, message: "" };

      return { isValid: false, message: "Invalid playlist" };
    }),

  saveDbPlaylistId: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { playlistId } = input;
      const { db } = ctx;

      return db.userSpotifyPlaylistIds.create({
        data: {
          userId: ctx.session.user.id,
          discoverWeeklyId: playlistId,
        },
      });
    }),

  triggerBackup: protectedProcedure.mutation(async ({ ctx }) => {
    const { db } = ctx;
    const userId = ctx.session.user.id;
    const week = getWeekNumber(new Date());
    const year = new Date().getFullYear();

    // First, check if we have already have a backup for this user
    // already this week
    const backupFind = await db.discoveredWeeklyBackup.findFirst({
      where: {
        userId,
        week,
        year,
      },
    });

    if (backupFind) {
      return backupFind;
    }

    // Instead of carrying on here, we are going to send it to an external edge function
    // to fetch the playlist items and save them to the database. This is to avoid the
    // 10 second timeout that Vercel has for serverless functions.
    void fetch(
      `${env.SUPABASE_URL}/functions/v1/backup`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: ctx.session.user.id }),
      },
    );
  }),
});
