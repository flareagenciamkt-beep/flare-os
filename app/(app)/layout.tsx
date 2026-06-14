import { FlareStoreProvider } from "@/lib/store";
import { AuthGuard } from "@/components/layout/auth-guard";
import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <FlareStoreProvider>
        <AppShell>{children}</AppShell>
      </FlareStoreProvider>
    </AuthGuard>
  );
}
