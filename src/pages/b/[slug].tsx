import { Layout } from "~/components/shared/Layout";
import { getServerAuthSession } from "~/server/auth";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { db } from "~/server/db";
import { z } from "zod";
import SpotifyTrack from "~/components/SpotifyTrack";

export default function Backup({
  backup,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Layout>
      <div className="h-full w-full bg-spotify-black p-2 pl-1">
        <div
          className="bg-transition flex h-full flex-col rounded-lg px-2 pb-2 pt-6 text-white"
          style={{
            backgroundImage: `linear-gradient(180deg, var(--backup-top-color) 0%, #121212 10%)`,
          }}
        >
          <h1 className="mb-4 select-none font-circular-title text-4xl font-black ml-4">
            {backup.year} Week {backup.week}
          </h1>
          <div className="grid grid-cols-1 gap-4 overflow-y-scroll sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
            {backup.tracks.map((track) => (
              <SpotifyTrack key={track.track.id} track={track.track} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
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
    };
  }

  try {
    // Get the backup ID from the slug and validate it with zod
    const slug = ctx.params?.slug;
    const slugSchema = z.string().min(1);
    const backupId = slugSchema.safeParse(slug);

    if (!backupId.success) {
      throw new Error("Invalid backup ID");
    }

    // Fetch the backup from the DB
    const backup = await db.discoveredWeeklyBackup.findFirst({
      where: {
        backupId: backupId.data,
        userId: _session.user.id,
      },
      select: {
        week: true,
        year: true,
        tracks: {
          select: {
            track: {
              select: {
                id: true,
                name: true,
                coverArtUrl: true,
                uri: true,
                colors: true,
                SpotifyTrackArtists: {
                  select: {
                    artist: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(backup);

    if (!backup) {
      throw new Error("Backup not found for the user");
    }

    // Return the backup data
    return {
      props: {
        backup,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      notFound: true,
    };
  }
}) satisfies GetServerSideProps;
