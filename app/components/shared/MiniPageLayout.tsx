export interface MiniPageLayoutProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}

export function MiniPageLayout({
  title,
  subtitle,
  children,
}: MiniPageLayoutProps) {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Kaizen Wheels
          </p>
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
