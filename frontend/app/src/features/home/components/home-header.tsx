export const HomeHeader = () => {
  return (
    <header className="border-b border-border bg-card/70 px-6 py-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <img
          src="/icon.jpeg"
          alt="Report Suite icon"
          className="size-9 rounded-md border border-border object-cover"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Product
          </p>
          <h1 className="text-lg font-semibold text-foreground md:text-xl">
            Report Suite
          </h1>
        </div>
      </div>
    </header>
  );
};
