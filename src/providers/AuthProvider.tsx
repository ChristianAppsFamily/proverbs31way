import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { ensureProfile } from "@/lib/sundayJournal/api";
import type { Profile } from "@/lib/sundayJournal/types";

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfileForUser(user: User | null): Promise<Profile | null> {
  if (!user) return null;
  try {
    return await ensureProfile();
  } catch (err) {
    console.error("Failed to load profile", err);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser();
    const next = await loadProfileForUser(user);
    setProfile(next);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      const next = await loadProfileForUser(data.session?.user ?? null);
      if (!mounted) return;
      setProfile(next);
      setLoading(false);

      // PKCE returns ?code= on the origin; clean the query once session is established.
      if (data.session && window.location.search.includes("code=")) {
        const url = new URL(window.location.href);
        url.search = "";
        window.history.replaceState({}, document.title, url.toString());
        if (!window.location.hash || window.location.hash === "#") {
          window.location.hash = "#/today";
        }
      }
    });

    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      const next = await loadProfileForUser(nextSession?.user ?? null);
      setProfile(next);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      refreshProfile,
    }),
    [loading, session, profile, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
