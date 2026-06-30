"use client";

// Provee el rol del usuario logueado y helpers de capacidades a todo el módulo
// agencia. En modo demo (sin Supabase) el rol es null → can() permite todo.

import * as React from "react";
import { getOwnProfile } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase";
import { can as canFor, type Capability } from "@/lib/permissions";
import type { Profile, Role } from "@/lib/types";

interface RoleContextValue {
  profile: Profile | null;
  role: Role | null;
  can: (capability: Capability) => boolean;
}

const RoleContext = React.createContext<RoleContextValue>({
  profile: null,
  role: null,
  can: () => true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    if (!isSupabaseConfigured) return;
    void getOwnProfile().then(setProfile);
  }, []);

  const value = React.useMemo<RoleContextValue>(
    () => ({
      profile,
      role: profile?.role ?? null,
      can: (capability) => canFor(profile?.role ?? null, capability),
    }),
    [profile],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return React.useContext(RoleContext);
}
