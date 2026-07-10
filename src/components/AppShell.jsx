// The dashboard IS the page: full viewport, off-white background, no outer
// frame, window, or browser chrome. The three columns sit directly on the page.
export default function AppShell({ children }) {
  return <div className="min-h-screen w-full bg-app">{children}</div>
}
