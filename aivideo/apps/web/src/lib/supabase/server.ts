import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function getRequiredEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }
  throw new Error(`${names.join(" or ")} is required.`);
}

export async function createClient() {
  const supabaseUrl = getRequiredEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]);
  const anonKey = getRequiredEnv(["NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY"]);
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set({ name, value, ...options })
        );
      }
    }
  });
}

export async function createAdminClient() {
  const supabaseUrl = getRequiredEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]);
  const serviceRoleKey = getRequiredEnv(["SUPABASE_SERVICE_ROLE_KEY"]);
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set({ name, value, ...options })
        );
      }
    }
  });
}
