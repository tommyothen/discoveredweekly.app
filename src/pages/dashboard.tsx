import { Layout } from "~/components/shared/Layout";
import type { GetServerSideProps, InferGetServerSidePropsType, PageConfig } from "next";
import dashboardServerSideProps from "~/server/utils/getServerSideProps/dashboard";
import { PromptForPlaylistId } from "~/components/PromptForPlaylistId";
import Head from "next/head";
import Image from "next/image";
import SuperJSON from "superjson";

export default function Dashboard(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  if (props.promptUser) {
    return (
      <>
        <Head>
          <title>Dashboard | Discovered Weekly</title>
        </Head>
        <PromptForPlaylistId open={props.promptUser} />
        <div className="h-screen w-screen bg-spotify-grey-900" />
      </>
    );
  }

  const {
    totalBackups,
    totalTracks,
    totalArtists,
    recentBackups,
    mostFrequentArtists,
  } = props.stats;
  const { name, image } = props.user;
  const joinedAt = new Date(
    SuperJSON.deserialize<Date>(props.user.joinedAt),
  ).toLocaleDateString();

  return (
    <>
      <Layout
        head={{
          title: "Dashboard",
        }}
      >
        <div className="h-full w-full bg-spotify-black p-2 pl-1 text-white">
          <div className="flex h-full flex-col rounded-lg bg-spotify-grey-900 p-6">
            {/* User Information */}
            <div className="mb-8 flex items-center">
              {image && (
                <div className="mr-4 h-16 w-16 overflow-hidden rounded-full">
                  <Image src={image} alt="User Avatar" width={64} height={64} />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{name}</h1>
                <p className="text-lg text-gray-400">Member since {joinedAt}</p>
              </div>
            </div>

            {/* Overview Section */}
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">Overview</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-spotify-grey-800 bg-opacity-60 p-4 hover:bg-opacity-100">
                  <h3 className="mb-2 text-lg font-bold">Total Backups</h3>
                  <p className="text-3xl font-bold">{totalBackups}</p>
                </div>
                <div className="rounded-lg bg-spotify-grey-800 bg-opacity-60 p-4 hover:bg-opacity-100">
                  <h3 className="mb-2 text-lg font-bold">Total Tracks</h3>
                  <p className="text-3xl font-bold">{totalTracks}</p>
                </div>
                <div className="rounded-lg bg-spotify-grey-800 bg-opacity-60 p-4 hover:bg-opacity-100">
                  <h3 className="mb-2 text-lg font-bold">Total Artists</h3>
                  <p className="text-3xl font-bold">{totalArtists}</p>
                </div>
              </div>
            </div>

            {/* Top Artists Section */}
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">Most Frequent Artists</h2>
              <div className="grid grid-cols-1 gap-4">
                {mostFrequentArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="flex items-center rounded-lg bg-spotify-grey-800 bg-opacity-60 p-4 hover:bg-opacity-100"
                  >
                    <div className="mr-4">
                      {/* Replace with artist profile picture */}
                      {artist.imageUrl !== "" ? (
                        <div className="h-12 w-12 rounded-full overflow-hidden">
                          <Image
                            src={artist.imageUrl}
                            alt={artist.name}
                            width={64}
                            height={64}
                          />
                        </div>
                      ): (
                        <div className="h-12 w-12 rounded-full bg-gray-400"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{artist.name}</h3>
                      <p className="text-sm">
                        Tracks: {artist._count.SpotifyTrackArtists}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Backups Section */}
            <div>
              <h2 className="mb-4 text-2xl font-bold">Recent Backups</h2>
              <div className="grid grid-cols-2 gap-4">
                {recentBackups.map((backup) => (
                  <div
                    key={backup.backupId}
                    className="rounded-lg bg-spotify-grey-800 bg-opacity-60 p-4 hover:bg-opacity-100"
                  >
                    <h3 className="mb-2 text-lg font-bold">
                      Week {backup.week}
                    </h3>
                    <p className="text-sm">Year: {backup.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const config: PageConfig = {
  maxDuration: 60,
}

export const getServerSideProps = (async (ctx) => {
  return dashboardServerSideProps(ctx);
}) satisfies GetServerSideProps;