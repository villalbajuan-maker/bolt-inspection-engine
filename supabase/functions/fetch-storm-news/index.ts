const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GNewsArticle {
  title: string;
  source: {
    name: string;
  };
  url: string;
  image?: string;
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q");
    const max = url.searchParams.get("max") || "1";

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Missing query parameter 'q'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const gnewsApiKey = Deno.env.get("GNEWS_API_KEY");

    if (!gnewsApiKey) {
      console.error("[fetch-storm-news] GNEWS_API_KEY not found");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=us&max=${max}&apikey=${gnewsApiKey}`;

    console.log("[fetch-storm-news] Fetching from GNews API:", query);

    const response = await fetch(gnewsUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[fetch-storm-news] GNews API error:", errorText);
      return new Response(
        JSON.stringify({ error: "GNews API request failed", details: errorText }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data: GNewsResponse = await response.json();

    console.log("[fetch-storm-news] Fetched articles count:", data.articles?.length || 0);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[fetch-storm-news] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
