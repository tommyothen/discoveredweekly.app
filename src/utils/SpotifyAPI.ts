export type SpotifyAPIResponse<T> = {
  _200: {
    status: 200;
    data: T;
  };
  _401: {
    status: 401;
    message: string; // Bad or expired token. This can happen if the user revoked a token or the access token has expired. You should re-authenticate the user.
  };
  _403: {
    status: 403;
    message: string; // Bad OAuth request (wrong consumer key, bad nonce, expired timestamp...).
  };
  _429: {
    status: 429;
    message: string; // The app has exceeded its rate limits.
  };
};

export type SpotifyAPITypes = {
  me: {
    playlists: {
      props: {
        limit?: number; // Default 20, Range 0-50
        offset?: number; // Default 0, Maximum 100,000
      };
      response: SpotifyAPIResponse<Paging<SimplifiedPlaylistObject>>;
    };
  };
  search: {
    props: {
      q: string;
      type: (
        | "album"
        | "artist"
        | "playlist"
        | "track"
        | "show"
        | "episode"
        | "audiobook"
      )[];
      market?: string;
      limit?: number; // Default 20, Range 0-50
      offset?: number; // Default 0, Maximum 100,000
      include_external?: "audio";
    };
    response: SpotifyAPIResponse<{
      tracks?: Paging<TrackObject>;
      artists?: Paging<ArtistObject>;
      albums?: Paging<SimplifiedAlbumObject>;
      playlists?: Paging<SimplifiedPlaylistObject>;
      shows?: Paging<SimplifiedShowObject>;
      episodes?: Paging<SimplifiedEpisodeObject>;
      audiobooks?: Paging<SimplifiedAudiobookObject>;
    }>;
  };
  playlists: {
    tracks: {
      props: {
        playlist_id: string;
        market?: string;
        fields?: string;
        limit?: number; // Default 20, Range 0-50
        offset?: number; // Default 0
        additional_types?: ("track" | "episode")[];
      };
      response: SpotifyAPIResponse<Paging<PlaylistTrackObject>>;
    };
    _playlist: {
      props: {
        playlist_id: string;
        market?: string;
        fields?: string;
        additional_types?: ("track" | "episode")[];
      };
      response: SpotifyAPIResponse<PlaylistObject>;
    };
  };
  artists: {
    _artist: {
      props: {
        artist_id: string;
      };
      response: SpotifyAPIResponse<ArtistObject>;
    }
  }
};

export type PlaylistObject = {
  collaborative: boolean;
  description: string | null;
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  owner: UserObject;
  public: boolean;
  snapshot_id: string;
  tracks: Paging<PlaylistTrackObject>;
  type: "playlist";
  uri: string;
};

export type Paging<T> = {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: T[];
};

export type TrackObject = {
  album: SimplifiedAlbumObject;
  artists: ArtistObject[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
    ean: string;
    upc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_playable: boolean;
  linked_from: TrackObject;
  restrictions: {
    reason: "market" | "product" | "explicit";
  };
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: "track";
  uri: string;
  is_local: boolean;
};

export type ArtistObject = {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  popularity: number;
  type: "artist";
  uri: string;
};

export type SimplifiedAlbumObject = {
  album_type: "album" | "single" | "compilation";
  total_tracks: number;
  available_markets: string[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  restrictions: {
    reason: "market" | "product" | "explicit";
  };
  type: "album";
  uri: string;
  artists: SimplifiedArtistObject[];
};

export type SimplifiedPlaylistObject = {
  collaborative: boolean;
  description: string;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  owner: {
    external_urls: {
      spotify: string;
    };
    followers: {
      href: string | null;
      total: number;
    };
    href: string;
    id: string;
    type: "user";
    uri: string;
    display_name: string | null;
  };
  public: boolean | null;
  snapshot_id: string;
  tracks: {
    href: string;
    total: number;
  };
  type: "playlist";
  uri: string;
};

export type SimplifiedShowObject = {
  available_markets: string[];
  copyrights: CopyrightObject[];
  description: string;
  html_description: string;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: ImageObject[];
  is_externally_hosted: boolean;
  languages: string[];
  media_type: string;
  name: string;
  publisher: string;
  type: "show";
  uri: string;
  total_episodes: number;
};

export type SimplifiedEpisodeObject = {
  audio_preview_url: string | null;
  description: string;
  html_description: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: ImageObject[];
  is_externally_hosted: boolean;
  is_playable: boolean;
  language: string;
  languages: string[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  resume_point: {
    fully_played: boolean;
    resume_position_ms: number;
  };
  type: "episode";
  uri: string;
  restrictions: {
    reason: "market" | "product" | "explicit";
  };
};

export type SimplifiedAudiobookObject = {
  authors: AuthorObject[];
  available_markets: string[];
  copyrights: CopyrightObject[];
  description: string;
  html_description: string;
  edition: string;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: ImageObject[];
  languages: string[];
  media_type: string;
  name: string;
  narrators: NarratorObject[];
  publisher: string;
  type: "audiobook";
  uri: string;
  total_chapters: number;
};

export type ImageObject = {
  url: string;
  height: number | null;
  width: number | null;
};

export type CopyrightObject = {
  text: string;
  type: "C" | "P";
};

export type AuthorObject = {
  name: string;
};

export type NarratorObject = {
  name: string;
};

export type SimplifiedArtistObject = {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
};

export type PlaylistTrackObject = {
  added_at: string;
  added_by: UserObject;
  is_local: boolean;
  track: TrackObject | EpisodeObject;
};

export type UserObject = {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  type: "user";
  uri: string;
  display_name: string | null;
};

export type EpisodeObject = {
  audio_preview_url: string | null;
  description: string;
  html_description: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: ImageObject[];
  is_externally_hosted: boolean;
  is_playable: boolean;
  language: string;
  languages: string[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  resume_point: {
    fully_played: boolean;
    resume_position_ms: number;
  };
  type: "episode";
  uri: string;
  restrictions: {
    reason: "market" | "product" | "explicit";
  };
  show: SimplifiedShowObject;
};

export class SpotifyAPI {
  private static readonly uri = "https://api.spotify.com/v1";

  private static createURL = (path: string) => new URL(SpotifyAPI.uri + path);

  static me = {
    playlists: {
      query: async (
        token: string,
        { limit = 20, offset = 0 }: SpotifyAPITypes["me"]["playlists"]["props"],
      ) => {
        // Create the URL
        const url = SpotifyAPI.createURL("/me/playlists");
        url.searchParams.append("limit", limit.toString());
        url.searchParams.append("offset", offset.toString());

        // Fetch the data
        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Parse the response
        if (response.status === 200) {
          return {
            status: 200,
            data: (await response.json()) as SpotifyAPITypes["me"]["playlists"]["response"]["_200"]["data"],
          } as SpotifyAPITypes["me"]["playlists"]["response"]["_200"];
        } else if (response.status === 401) {
          return (await response.json()) as SpotifyAPITypes["me"]["playlists"]["response"]["_401"];
        } else if (response.status === 403) {
          return (await response.json()) as SpotifyAPITypes["me"]["playlists"]["response"]["_403"];
        } else if (response.status === 429) {
          return (await response.json()) as SpotifyAPITypes["me"]["playlists"]["response"]["_429"];
        }
      },
    },
  };

  static search = {
    query: async (
      token: string,
      {
        q,
        type,
        market,
        limit = 20,
        offset = 0,
        include_external,
      }: SpotifyAPITypes["search"]["props"],
    ) => {
      // Create the URL
      const url = SpotifyAPI.createURL("/search");
      url.searchParams.append("q", q);
      url.searchParams.append("type", type.join(","));
      if (market) url.searchParams.append("market", market);
      url.searchParams.append("limit", limit.toString());
      url.searchParams.append("offset", offset.toString());
      if (include_external)
        url.searchParams.append("include_external", include_external);

      // Fetch the data
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Parse the response
      if (response.status === 200) {
        return {
          status: 200,
          data: (await response.json()) as SpotifyAPITypes["search"]["response"]["_200"]["data"],
        };
      } else if (response.status === 401) {
        return (await response.json()) as SpotifyAPITypes["search"]["response"]["_401"];
      } else if (response.status === 403) {
        return (await response.json()) as SpotifyAPITypes["search"]["response"]["_403"];
      } else if (response.status === 429) {
        return (await response.json()) as SpotifyAPITypes["search"]["response"]["_429"];
      }
    },
  };

  static playlists = {
    tracks: {
      query: async (
        token: string,
        {
          playlist_id,
          market,
          fields,
          limit = 20,
          offset = 0,
          additional_types,
        }: SpotifyAPITypes["playlists"]["tracks"]["props"],
      ) => {
        // Create the URL
        const url = SpotifyAPI.createURL(`/playlists/${playlist_id}/tracks`);
        if (market) url.searchParams.append("market", market);
        if (fields) url.searchParams.append("fields", fields);
        url.searchParams.append("limit", limit.toString());
        url.searchParams.append("offset", offset.toString());
        if (additional_types)
          url.searchParams.append(
            "additional_types",
            additional_types.join(","),
          );

        // Fetch the data
        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Parse the response
        if (response.status === 200) {
          return {
            status: 200,
            data: (await response.json()) as SpotifyAPITypes["playlists"]["tracks"]["response"]["_200"]["data"],
          };
        } else if (response.status === 401) {
          return (await response.json()) as SpotifyAPITypes["playlists"]["tracks"]["response"]["_401"];
        } else if (response.status === 403) {
          return (await response.json()) as SpotifyAPITypes["playlists"]["tracks"]["response"]["_403"];
        } else if (response.status === 429) {
          return (await response.json()) as SpotifyAPITypes["playlists"]["tracks"]["response"]["_429"];
        }
      },
    },
    _playlist: {
      query: async (
        token: string,
        {
          playlist_id,
          market,
          fields,
          additional_types,
        }: SpotifyAPITypes["playlists"]["_playlist"]["props"],
      ) => {
        // Create the URL
        const url = SpotifyAPI.createURL(`/playlists/${playlist_id}`);
        if (market) url.searchParams.append("market", market);
        if (fields) url.searchParams.append("fields", fields);
        if (additional_types)
          url.searchParams.append(
            "additional_types",
            additional_types.join(","),
          );

        // Fetch the data
        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Parse the response
        if (response.status === 200) {
          return {
            status: 200,
            data: (await response.json()) as SpotifyAPITypes["playlists"]["_playlist"]["response"]["_200"]["data"],
          };
        } else if (response.status === 401) {
          return (await response.json()) as SpotifyAPITypes["playlists"]["_playlist"]["response"]["_401"];
        } else if (response.status === 403) {
          return (await response.json()) as SpotifyAPITypes["playlists"]["_playlist"]["response"]["_403"];
        } else if (response.status === 429) {
          return (await response.json()) as SpotifyAPITypes["playlists"]["_playlist"]["response"]["_429"];
        }
      },
    },
  };

  static artists = {
    _artist: {
      query: async (
        token: string,
        {
          artist_id
        }: SpotifyAPITypes["artists"]["_artist"]["props"],
      ) => {
        // Create the URL
        const url = SpotifyAPI.createURL(`/artists/${artist_id}`);

        // Fetch the data
        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Parse the response
        if (response.status === 200) {
          return {
            status: 200,
            data: (await response.json()) as SpotifyAPITypes["artists"]["_artist"]["response"]["_200"]["data"],
          };
        } else if (response.status === 401) {
          return (await response.json()) as SpotifyAPITypes["artists"]["_artist"]["response"]["_401"];
        } else if (response.status === 403) {
          return (await response.json()) as SpotifyAPITypes["artists"]["_artist"]["response"]["_403"];
        } else if (response.status === 429) {
          return (await response.json()) as SpotifyAPITypes["artists"]["_artist"]["response"]["_429"];
        }
      }
    }
  }
}
