
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

console.log("Hello from upload-papers-cron!");

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    // Basic check to ensure it's not being called publicly without auth if we wanted to
    // But cron jobs are internal. We'll secure the destination API call.

    console.log("Triggering daily paper upload...");

    const appUrl = Deno.env.get('APP_URL');
    const serviceRoleKey = Deno.env.get('PAPER_SUPABASE_SERVICE_ROLE_KEY');

    if (!appUrl || !serviceRoleKey) {
      throw new Error("Missing configuration: APP_URL or PAPER_SUPABASE_SERVICE_ROLE_KEY");
    }

    // Default to localhost for dev if not specified, but usually APP_URL should be set
    const targetUrl = `${appUrl}/api/admin/upload-papers`;

    console.log(`Calling ${targetUrl}...`);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        categories: ["cs.AI", "cs.LG"],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Failed to trigger upload: ${response.status} ${text}`);
      return new Response(JSON.stringify({ error: `Failed: ${response.status}` }), {
        headers: { "Content-Type": "application/json" },
        status: 500
      });
    }

    const data = await response.json();
    console.log("Upload triggered successfully:", data);

    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Cron function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
