export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-prune-main flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white-pure p-8 border border-sable-gold/20">
        {children}
      </div>
    </div>
  )
}
