import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Hello from Backup-all!");

function getSupabaseUrl() {
  return Deno.env.get("_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
}

function getSupabaseServiceRoleKey() {
  return (
    Deno.env.get("_SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    ""
  );
}

const supabaseClient = createClient(
  getSupabaseUrl(),
  getSupabaseServiceRoleKey(),
);

async function getAllUsersWithWeeklyBackup() {
  const { data: users, error } = await supabaseClient
    .from("UserSettings")
    .select("userId")
    .eq("weeklyBackup", true);

  if (error) {
    console.error("Error retrieving users:", error);
    throw error;
  }

  return users?.map((user) => user.userId) || [];
}

async function triggerBackupForUser(userId: string) {
  const url = "https://mujzpujipmtdzrktklty.supabase.co/functions/v1/backup";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getSupabaseServiceRoleKey()}`,
  };
  const body = { userId };

  const { data, error } = await supabaseClient.rpc("http_post_json_v3", {
    url,
    headers,
    body,
  });

  if (error) {
    console.error(`Error triggering backup for user ${userId}:`, error);
    throw error;
  }

  return data;
}

Deno.serve(async () => {
  try {
    const userIds = await getAllUsersWithWeeklyBackup();
    console.log(`Found ${userIds.length} users with weeklyBackup set to true`);

    const backupPromises = userIds.map((userId) =>
      triggerBackupForUser(userId),
    );
    await Promise.all(backupPromises);

    console.log("Backup triggered for all users successfully");

    return new Response("Backup triggered for all users", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("Error triggering backups:", error);
    return new Response("Error triggering backups", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
});
