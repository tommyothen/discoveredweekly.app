import Head from "next/head";
import { StatsBox } from "~/components/StatsBox";
import { Users, Archive, LibraryBig, Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const { userCount, backupsCount, uniqueTracksCount } = props.statsData;
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Discovered Weekly</title>
        <meta
          name="description"
          content="Effortlessly archive your Spotify Discover Weekly playlists."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid min-h-screen place-items-center bg-spotify-grey-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="mb-8 text-5xl font-bold">
              <span className="text-white">Discovered</span>{" "}
              <span className="gradient-text font-circular-title">Weekly</span>
            </h1>
            <p className="text-spotify-grey-300 mb-12 text-xl">
              Effortlessly archive your Spotify Discover Weekly playlists.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <StatsBox
              Icon={Users}
              title="Registed Users"
              value={userCount.toString()}
            />
            <StatsBox
              Icon={Archive}
              title="Playlists Archived"
              value={backupsCount.toString()}
            />
            <StatsBox
              Icon={LibraryBig}
              title="Tracks Discovered"
              value={uniqueTracksCount.toString()}
            />
          </div>
          <div className="mt-16 text-center">
            <button
              className="inline-block rounded-full bg-spotify-green px-8 py-3 font-bold transition duration-300 hover:bg-spotify-green-dark"
              onClick={() =>
                props._session
                  ? router.push("/dashboard")
                  : signIn("spotify", { callbackUrl: "/dashboard" })
              }
            >
              {props._session ? "Go to Dashboard" : "Sign in with Spotify"}
            </button>
          </div>
        </div>
      </main>
      <footer className="w-screen bg-spotify-grey-900 py-12 text-center text-white md:absolute md:bottom-0 md:bg-transparent md:text-left">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 md:mb-0">
              <p className="text-spotify-grey-300 text-sm">
                Made with ❤️ by{" "}
                <a
                  href="https://github.com/tommyothen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-spotify-green hover:underline"
                >
                  Tommy Othen
                </a>
              </p>
              <p className="text-spotify-grey-300 text-sm">
                Not affiliated with Spotify
              </p>
            </div>
            <div>
              <a
                href="https://github.com/tommyothen/discoveredweekly.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-spotify-grey-300 flex items-center hover:text-spotify-green"
              >
                <Github size={20} className="mr-2" />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export const getServerSideProps = (async (ctx) => {
  return {
    props: {
      statsData: {
        userCount: await db.user.count(),
        backupsCount: await db.discoveredWeeklyBackup.count(),
        uniqueTracksCount: await db.spotifyTrack.count(),
      },
      _session: await getServerAuthSession(ctx),
    },
  };
}) satisfies GetServerSideProps;
