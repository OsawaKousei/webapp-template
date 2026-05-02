import { UserProfileWidget } from '../features/user-profile';

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 md:px-10 lg:py-14">
        <header className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Widget-Oriented React
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-card-foreground md:text-5xl">
            Frontend Workspace Rebuild Starter
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            This baseline follows strict TypeScript and layered UI architecture.
            Layout controls composition, widget handles data wiring, and pure
            view renders the UI.
          </p>
        </header>

        <main className="grid gap-6 lg:grid-cols-2">
          <UserProfileWidget />

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-card-foreground">
              Architecture Checklist
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Data fetching is isolated in feature API hooks.</li>
              <li>UI states are modeled with discriminated unions.</li>
              <li>Pure View has no external dependency and no side effects.</li>
              <li>Tailwind semantic tokens are used for all visual roles.</li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
};
