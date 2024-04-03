import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const backupsRouter = createTRPCRouter({
  countBackups: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.discoveredWeeklyBackup.count();
  }),

  getBackup: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.db.discoveredWeeklyBackup.findFirst({
        where: {
          backupId: input,
          userId,
        },
      });
    }),

  getMyBackups: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return await ctx.db.discoveredWeeklyBackup.findMany({
      where: {
        userId,
      },
    });
  }),
});
