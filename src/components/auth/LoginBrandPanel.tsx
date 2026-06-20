import LoginIllustration from '@/components/auth/LoginIllustration'

export default function LoginBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-prune-main text-prune-light p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-prune-main via-prune-main to-prune-sec/30 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 border border-sable-gold/40 mb-6">
          <span className="text-3xl font-bold text-prune-light">OSS</span>
        </div>
        <h2 className="text-xl font-semibold text-prune-light mb-2">Gestion des prestations</h2>
        <p className="text-sm text-prune-light/70 mb-10">
          Plateforme de gestion des remboursements et feuilles de maladie
        </p>
        <LoginIllustration />
      </div>
    </div>
  )
}
