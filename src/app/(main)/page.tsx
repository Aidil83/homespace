export default function HomePage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Welcome to Homespace</h1>
        <p className="text-muted-foreground">
          Select a page from the sidebar or create a new one.
        </p>
      </div>
    </div>
  );
}
