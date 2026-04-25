const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENWEATHERMAP_API_KEY");
    if (!apiKey) {
      throw new Error("OPENWEATHERMAP_API_KEY is not configured");
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=Stuttgart,DE&appid=${apiKey}&units=metric&lang=fr`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenWeatherMap API failed [${response.status}]: ${text}`);
    }

    const data = await response.json();

    const main = (data.weather?.[0]?.main || "Clouds").toLowerCase();
    let weather: "rain" | "sun" | "snow" | "cloud" = "cloud";
    if (main.includes("rain") || main.includes("drizzle") || main.includes("thunder")) weather = "rain";
    else if (main.includes("snow")) weather = "snow";
    else if (main.includes("clear")) weather = "sun";
    else weather = "cloud";

    const result = {
      city: "Stuttgart",
      weather,
      description: data.weather?.[0]?.description ?? "",
      temperature: Math.round(data.main?.temp ?? 0),
      humidity: data.main?.humidity ?? 0,
      wind: Math.round((data.wind?.speed ?? 0) * 10) / 10,
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("get-weather error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
