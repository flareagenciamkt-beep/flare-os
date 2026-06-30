import { FlareStoreProvider } from "@/lib/store";
import { AuthGuard } from "@/components/layout/auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { RoleProvider } from "@/components/layout/role-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleProvider>
        <FlareStoreProvider>
          <AppShell>{children}</AppShell>
        </FlareStoreProvider>
      </RoleProvider>
    </AuthGuard>
  );
}
