export const ANILIST_API = 'https://graphql.anilist.co';

export async function fetchAniList(query: string, variables: Record<string, any> = {}) {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const { data, errors } = await response.json();
  
  if (errors) {
    throw new Error(errors[0]?.message || 'AniList API error');
  }
  
  return data;
}

export const GET_TRENDING_ANIME = `
query GetTrendingAnime($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: TRENDING_DESC) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
      averageScore
      episodes
      genres
      status
      nextAiringEpisode {
        airingAt
        episode
      }
    }
  }
}
`;

export const SEARCH_ANIME = `
query SearchAnime($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
      id
      title {
        romaji
        english
      }
      coverImage {
        large
      }
      bannerImage
      averageScore
      episodes
      status
      genres
    }
  }
}
`;

export const GET_ANIME_BY_IDS = `
query GetAnimeByIds($ids: [Int]) {
  Page(page: 1, perPage: 50) {
    media(id_in: $ids, type: ANIME) {
      id
      title {
        romaji
        english
      }
      coverImage {
        large
      }
      episodes
      averageScore
      status
      genres
    }
  }
}
`;

export const GET_ANIME_DETAILS = `
query GetAnimeDetails($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    description(asHtml: false)
    coverImage {
      extraLarge
      large
    }
    bannerImage
    averageScore
    episodes
    duration
    genres
    status
    season
    seasonYear
    format
    studios(isMain: true) {
      nodes { name }
    }
    nextAiringEpisode {
      airingAt
      episode
    }
    startDate { year month day }
  }
}
`;