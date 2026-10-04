/* Re-mounts on every navigation, so each page develops out of black. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-expose">{children}</div>;
}
