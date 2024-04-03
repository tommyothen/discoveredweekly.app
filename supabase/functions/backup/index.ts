import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Hello from Backup!");

function getWeekNumber(date: Date): number {
  // Copy the input date to avoid modifying the original
  const d = new Date(date);

  // Set the date to the first day of the year
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));

  // Get the first day of the year
  const yearStart = new Date(d.getFullYear(), 0, 1);

  // Calculate the number of days between the given date and the start of the year
  const dayOfYear = Math.floor((d.getTime() - yearStart.getTime()) / 86400000);

  // Calculate the week number
  const weekNumber = Math.ceil((dayOfYear + 1) / 7);

  return weekNumber;
}

function cuid() {
  const defaultLength = 24;
  const bigLength = 32;

  const createEntropy = (length = 4, random = Math.random) => {
    let entropy = "";

    while (entropy.length < length) {
      entropy = entropy + Math.floor(random() * 36).toString(36);
    }
    return entropy;
  };

  // MurmurHash3 implementation for hashing
  // Source: https://github.com/garycourt/murmurhash-js
  const murmurHash3 = (key) => {
    let h = 0x6384978c;
    let k;
    for (let i = 0, l = key.length; i < l; i++) {
      k = key.charCodeAt(i);
      k ^= k >>> 16;
      k *= 0x85ebca6b;
      k ^= k >>> 13;
      k *= 0xc2b2ae35;
      h ^= k;
      h ^= h >>> 16;
    }
    return (h >>> 0).toString(36);
  };

  const alphabet = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(i + 97),
  );

  const randomLetter = (random) =>
    alphabet[Math.floor(random() * alphabet.length)];

  const createFingerprint = ({
    globalObj = typeof global !== "undefined"
      ? global
      : typeof window !== "undefined"
        ? window
        : {},
    random = Math.random,
  } = {}) => {
    const globals = Object.keys(globalObj).toString();
    const sourceString = globals.length
      ? globals + createEntropy(bigLength, random)
      : createEntropy(bigLength, random);

    return murmurHash3(sourceString).substring(0, bigLength);
  };

  const createCounter = (count) => () => {
    return count++;
  };

  const initialCountMax = 476782367;

  const init = ({
    random = Math.random,
    counter = createCounter(Math.floor(random() * initialCountMax)),
    length = defaultLength,
    fingerprint = createFingerprint({ random }),
  } = {}) => {
    return function cuid() {
      const firstLetter = randomLetter(random);

      const time = Date.now().toString(36);
      const count = counter().toString(36);

      const salt = createEntropy(length, random);
      const hashInput = `${time + salt + count + fingerprint}`;

      return `${firstLetter + murmurHash3(hashInput).substring(0, length)}`;
    };
  };

  const createId = init();

  return `${createId()}${createId()}${createId()}${createId()}`;
}

async function refreshAccessToken(
  providerAccountId: string,
  refreshToken: string,
  supabaseClient: any,
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
        client_id: Deno.env.get("SPOTIFY_CLIENT_ID") ?? "",
        client_secret: Deno.env.get("SPOTIFY_CLIENT_SECRET") ?? "",
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

    // Update the refresh token and access token in the database using Supabase
    const { error: updateError } = await supabaseClient
      .from("Account")
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      })
      .eq("providerAccountId", providerAccountId);

    if (updateError) {
      console.error(
        "Error updating access token in the database:",
        updateError,
      );
      throw updateError;
    }

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

async function getDiscoverWeeklyPlaylistId(
  userId: string,
  supabaseClient: any,
): Promise<string | null> {
  try {
    const { data: spotifyPlaylists, error: spotifyPlaylistsError } =
      await supabaseClient
        .from("UserSpotifyPlaylistIds")
        .select("discoverWeeklyId")
        .eq("userId", userId)
        .single();

    if (spotifyPlaylistsError) {
      console.error(
        "Error fetching user's Spotify playlists:",
        spotifyPlaylistsError,
      );
      return null;
    }

    if (spotifyPlaylists !== null) {
      return spotifyPlaylists.discoverWeeklyId;
    }

    throw new Error("Discover Weekly playlist not found for the user");
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function saveTrackAndArtists(track: TrackObject, supabaseClient: any) {
  let colors: Array<string> = ["#121212"];

  // if (track.album.images.length > 0) {
  //   const image = track.album.images[0]!.url;
  //   const c = await getImageColours(image);

  //   colors = c.map((color) => color.hex());
  // }

  const { data: spotifyTrack, error: upsertTrackError } = await supabaseClient
    .from("SpotifyTrack")
    .upsert({
      id: track.id,
      name: track.name,
      uri: track.uri,
      coverArtUrl: track.album.images[0]?.url ?? "",
      colors,
    })
    .select()
    .single();

  if (upsertTrackError) {
    console.error("Error upserting Spotify track:", upsertTrackError);
    throw upsertTrackError;
  }

  await Promise.all(
    track.artists.map(async (artist) => {
      const { error: upsertArtistError } = await supabaseClient
        .from("SpotifyArtist")
        .upsert({
          id: artist.id,
          name: artist.name,
          uri: artist.uri,
          imageUrl: "",
        });

      if (upsertArtistError) {
        console.error("Error upserting Spotify artist:", upsertArtistError);
        throw upsertArtistError;
      }
    }),
  );

  await Promise.all(
    track.artists.map(async (artist) => {
      const { error: upsertTrackArtistsError } = await supabaseClient
        .from("SpotifyTrackArtists")
        .upsert({
          trackId: track.id,
          artistId: artist.id,
        });

      if (upsertTrackArtistsError) {
        console.error(
          "Error upserting Spotify track artists:",
          upsertTrackArtistsError,
        );
        throw upsertTrackArtistsError;
      }
    }),
  );

  return spotifyTrack;
}

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

async function triggerBackup(userId: string) {
  const week = getWeekNumber(new Date());
  const year = new Date().getFullYear();

  console.log(
    `Triggering backup for user ${userId} for week ${week} of ${year}`,
  );

  // First, check if we have already have a backup for this user
  // already this week
  const { data: backupFind, error: backupFindError } = await supabaseClient
    .from("DiscoveredWeeklyBackup")
    .select("*")
    .eq("userId", userId)
    .eq("week", week)
    .eq("year", year)
    .maybeSingle();

  if (backupFindError) {
    console.error("Error finding backup:", backupFindError);
    return { error: "Error finding backup" };
  }

  console.log("Backup find:", backupFind);

  if (backupFind) {
    return backupFind;
  }

  // Refresh the access token just in case it's expired
  const { data: account, error: accountError } = await supabaseClient
    .from("Account")
    .select("providerAccountId, refresh_token")
    .eq("userId", userId)
    .single();

  if (accountError) {
    console.error("Error finding account:", accountError);
    return { error: "No account found" };
  }

  console.log("Account:", account);

  if (!account?.refresh_token) {
    return { error: "No account found" };
  }

  console.log("Refreshing access token");

  const accessToken = await refreshAccessToken(
    account.providerAccountId,
    account.refresh_token,
    supabaseClient,
  );

  if (!accessToken) {
    return { error: "Error refreshing access token" };
  }

  console.log("Access token:", accessToken);

  // Get the playlist ID
  const discoverWeeklyId = await getDiscoverWeeklyPlaylistId(
    userId,
    supabaseClient,
  );

  console.log("Discover Weekly ID:", discoverWeeklyId);

  if (!discoverWeeklyId) {
    return { error: "Error getting Discover Weekly playlist ID" };
  }

  console.log("Fetching playlist items");

  const discoverWeeklyItemsResponse = await fetch(
    `https://api.spotify.com/v1/playlists/${discoverWeeklyId}/tracks?limit=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  console.log("Discover Weekly items response:", discoverWeeklyItemsResponse);

  if (!discoverWeeklyItemsResponse.ok) {
    return {
      error: `Error fetching playlist items: ${discoverWeeklyItemsResponse.status}`,
    };
  }

  console.log("Discover Weekly items response OK");

  const discoverWeeklyItemsData = await discoverWeeklyItemsResponse.json();
  const playlistTrackObjects = discoverWeeklyItemsData.items
    .map((item: any) => {
      if (item.track.type === "track") {
        return item.track;
      }
    })
    .filter((item: any): item is TrackObject => item !== undefined);

  const backupId = cuid();
  const { data: backup, error: backupError } = await supabaseClient
    .from("DiscoveredWeeklyBackup")
    .insert({ userId, week, year, backupId })
    .select()
    .single();

  console.log("Backup:", backup);

  if (backupError) {
    console.error("Error creating backup:", backupError);
    return { error: "Error creating backup" };
  }

  console.log("Saving tracks and artists");

  await Promise.all(
    playlistTrackObjects.map(async (track) => {
      const spotifyTrack = await saveTrackAndArtists(track, supabaseClient);
      await supabaseClient.from("DiscoveredWeeklyBackupTrack").insert({
        backupId: backup.backupId,
        trackId: spotifyTrack.id,
      });
    }),
  );

  console.log("Backup complete");

  return backup;
}

Deno.serve(async (req) => {
  const { userId } = await req.json();
  if (!userId || typeof userId !== "string") {
    return new Response("Missing userId", { status: 400 });
  }

  console.log(`Triggering backup for user ${userId}`);

  const result = await triggerBackup(userId);

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
