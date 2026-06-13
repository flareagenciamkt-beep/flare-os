import { FlareStoreProvider } from "@/lib/store";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <FlareStoreProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main
              className="flex-1 overflow-y-auto"
              style={{
                background:
                  "radial-gradient(1100px 480px at 72% -220px, rgba(245,42,108,0.05), transparent 70%), #0A0808",
              }}
            >
              <div className="mx-auto w-full max-w-[1440px] px-7 py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </FlareStoreProvider>
    </AuthGuard>
  );
}
