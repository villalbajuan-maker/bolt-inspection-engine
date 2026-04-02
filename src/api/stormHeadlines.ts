export interface StormHeadline {
  title: string;
  source: string;
  url?: string;
}

export interface StormImage {
  url: string;
  photographer: string;
  photographerUrl: string;
}

const STORM_HEADLINE_TEMPLATES = {
  impact: [
    { title: "Hurricane damage continues across coastal Florida communities", source: "Florida Emergency Management" },
    { title: "Recent tropical storm causes widespread roof and structural damage in Southwest Florida", source: "Associated Press" },
    { title: "Severe wind damage reported following Category 3 hurricane landfall", source: "National Hurricane Center" },
    { title: "Hurricane-force winds damage thousands of homes across Gulf Coast region", source: "Tampa Bay Times" },
    { title: "Post-storm assessment reveals extensive property damage in coastal counties", source: "Florida Division of Emergency Management" }
  ],
  exposure: [
    { title: "Florida residents urged to prepare for increased storm activity during hurricane season", source: "National Weather Service" },
    { title: "NOAA forecasts above-average hurricane activity for Atlantic basin this season", source: "NOAA Climate Prediction Center" },
    { title: "Coastal communities brace for peak hurricane season amid warming ocean temperatures", source: "Miami Herald" },
    { title: "Historic hurricane patterns show increased risk for Florida Peninsula regions", source: "Florida State University Hurricane Research" },
    { title: "Emergency officials warn of elevated storm surge threat during active hurricane period", source: "National Hurricane Center" }
  ],
  flooding: [
    { title: "Flood-related insurance claims surge following severe weather events", source: "Florida Office of Insurance Regulation" },
    { title: "Heavy rainfall triggers flash flooding across low-lying coastal neighborhoods", source: "National Weather Service Tampa Bay" },
    { title: "Storm surge and inland flooding overwhelm drainage systems in multiple counties", source: "Southwest Florida Water Management District" },
    { title: "Tropical downpours cause significant street flooding and water intrusion damage", source: "Local Emergency Response" },
    { title: "Record rainfall totals lead to widespread flooding and property damage claims", source: "Florida Division of Emergency Management" }
  ]
};

const FALLBACK_IMAGES: StormImage[] = [
  {
    url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&q=80',
    photographer: 'NOAA',
    photographerUrl: 'https://unsplash.com/@noaa'
  },
  {
    url: 'https://images.unsplash.com/photo-1574116294628-3ad1e8eedc49?w=800&q=80',
    photographer: 'NASA',
    photographerUrl: 'https://unsplash.com/@nasa'
  },
  {
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80',
    photographer: 'Matt Howard',
    photographerUrl: 'https://unsplash.com/@thematthoward'
  }
];

function generateContextualHeadlines(city?: string): StormHeadline[] {
  const categories = ['impact', 'exposure', 'flooding'] as const;
  const dayOffset = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  return categories.map((category, index) => {
    const templates = STORM_HEADLINE_TEMPLATES[category];
    const selectedIndex = (dayOffset + index) % templates.length;
    const headline = templates[selectedIndex];

    if (city) {
      const cityModifiedTitle = headline.title.replace(
        /(Florida|coastal|Gulf Coast|Southwest Florida)/gi,
        `${city} area`
      );
      return {
        ...headline,
        title: cityModifiedTitle
      };
    }

    return headline;
  });
}

async function fetchSingleHeadline(query: string): Promise<StormHeadline | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const url = `${supabaseUrl}/functions/v1/fetch-storm-news?q=${encodeURIComponent(query)}&max=1`;

    console.log('[Storm Evidence] Fetching headline for query:', query);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    console.log('[Storm Evidence] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Storm Evidence] API error:', errorText);
      return null;
    }

    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      console.log('[Storm Evidence] No articles in response for query:', query);
      return null;
    }

    const article = data.articles[0];
    console.log('[Storm Evidence] Found article:', article.title);

    return {
      title: article.title,
      source: article.source?.name || 'News Source',
      url: article.url
    };
  } catch (error) {
    console.error('[Storm Evidence] Error fetching single headline:', error);
    return null;
  }
}

export async function fetchStormHeadlines(city?: string): Promise<StormHeadline[]> {
  try {
    console.log('[Storm Evidence] Fetching headlines for city:', city || 'Florida (default)');

    const searchQueries = city
      ? [
          `"${city}" AND hurricane`,
          `"${city}" AND storm`,
          `"${city}" AND flooding`
        ]
      : [
          'florida AND hurricane',
          'florida AND storm',
          'florida AND flooding'
        ];

    console.log('[Storm Evidence] Search queries:', searchQueries);

    const headlinePromises = searchQueries.map(query =>
      fetchSingleHeadline(query)
    );

    const results = await Promise.all(headlinePromises);

    const fetchedHeadlines = results.filter((h): h is StormHeadline => h !== null);

    console.log('[Storm Evidence] Fetched headlines count:', fetchedHeadlines.length);
    console.log('[Storm Evidence] Headlines:', fetchedHeadlines);

    if (fetchedHeadlines.length === 3) {
      return fetchedHeadlines;
    }

    if (fetchedHeadlines.length === 0) {
      console.log('[Storm Evidence] No headlines fetched, using all fallbacks');
      return generateContextualHeadlines(city);
    }

    console.log('[Storm Evidence] Partial results, mixing with fallbacks');
    const fallbacks = generateContextualHeadlines(city);
    const combined = [...fetchedHeadlines];

    while (combined.length < 3) {
      combined.push(fallbacks[combined.length]);
    }

    return combined;

  } catch (error) {
    console.error('[Storm Evidence] Error fetching headlines:', error);
    return generateContextualHeadlines(city);
  }
}

async function fetchSingleImage(query: string, accessKey: string): Promise<StormImage | null> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const photo = data.results[0];
    return {
      url: photo.urls.regular,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html
    };
  } catch (error) {
    return null;
  }
}

export async function fetchStormImages(_city?: string): Promise<StormImage[]> {
  try {
    const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    if (!unsplashKey || unsplashKey === '') {
      return FALLBACK_IMAGES;
    }

    const searchQueries = [
      'hurricane damage florida',
      'hurricane florida coast storm',
      'flooding street florida storm'
    ];

    const imagePromises = searchQueries.map(query =>
      fetchSingleImage(query, unsplashKey)
    );

    const results = await Promise.all(imagePromises);

    const fetchedImages = results.filter((img): img is StormImage => img !== null);

    if (fetchedImages.length === 3) {
      return fetchedImages;
    }

    const combined = [...fetchedImages];
    while (combined.length < 3) {
      combined.push(FALLBACK_IMAGES[combined.length]);
    }

    return combined;

  } catch (error) {
    return FALLBACK_IMAGES;
  }
}

export function getLocationBasedImageUrl(index: number, _city?: string): string {
  const stormImages = {
    impact: [
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      'https://images.unsplash.com/photo-1561553543-1e86850d5697?w=800&q=80',
      'https://images.unsplash.com/photo-1504803900752-c2051699d0e8?w=800&q=80'
    ],
    exposure: [
      'https://images.unsplash.com/photo-1574116294628-3ad1e8eedc49?w=800&q=80',
      'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=800&q=80',
      'https://images.unsplash.com/photo-1589943122243-d1671dc61146?w=800&q=80',
      'https://images.unsplash.com/photo-1514575110897-1253ff7b2ccb?w=800&q=80'
    ],
    flooding: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&q=80',
      'https://images.unsplash.com/photo-1563455372-a90c82e8c9f6?w=800&q=80',
      'https://images.unsplash.com/photo-1609102026400-2f8c9b0a7e1f?w=800&q=80',
      'https://images.unsplash.com/photo-1547150492-32dc89d69772?w=800&q=80'
    ]
  };

  const categories = ['impact', 'exposure', 'flooding'] as const;
  const category = categories[index] || categories[0];
  const collection = stormImages[category];

  const dayOffset = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const imageIndex = (dayOffset + index * 7) % collection.length;

  return collection[imageIndex];
}
