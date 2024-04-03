import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const settingsRouter = createTRPCRouter({
  toggleSetting: protectedProcedure
    .input(
      z.union([
        z.literal("weeklyBackup"),
        z.literal("automaticSyncToPlaylist"),
      ]),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { db } = ctx;

      const currentSetting = await db.userSettings
        .findFirst({
          where: { userId },
          select: { [input]: true },
        })
        .then((settings) => settings![input]);

      const newSettings = await db.userSettings.update({
        where: { userId },
        data: { [input]: !currentSetting },
      });

      return newSettings[input];
    }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const { db } = ctx;

    // Have to delete everything in the database that is associated with the user
    // Delete the user's backups and associated tracks
    // Delete the user's backup tracks
    await db.discoveredWeeklyBackupTrack.deleteMany({
      where: {
        backup: {
          userId: userId,
        },
      },
    });

    // Delete the user's backups
    await db.discoveredWeeklyBackup.deleteMany({
      where: {
        userId: userId,
      },
    });

    // Delete the user's settings
    await db.userSettings.deleteMany({
      where: {
        userId: userId,
      },
    });

    // Delete the user's sessions
    await db.session.deleteMany({
      where: {
        userId: userId,
      },
    });

    // Delete the user's accounts
    await db.account.deleteMany({
      where: {
        userId: userId,
      },
    });

    // Delete the saved user Spotify Playlists
    await db.userSpotifyPlaylistIds.deleteMany({
      where: {
        userId: userId,
      },
    });

    // Finally, delete the user
    await db.user.delete({
      where: {
        id: userId,
      },
    });

    return true;
  }),
});
