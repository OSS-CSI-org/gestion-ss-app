import Image from 'next/image'

export default function LoginBrandPanel() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center bg-prune-main text-prune-light p-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-prune-main via-prune-main to-prune-sec/30 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="mb-6">
          <Image
            src="/logo_blanc.png"
            alt="OSS"
            width={180}
            height={180}
            className="object-contain"
            priority
          />
        </div>
        <h2 className="text-xl font-semibold text-prune-light mb-2">Organisme de Sécurité Sociale (OSS)</h2>
        <p className="text-sm text-prune-light/70 mb-10">
          Plateforme de gestion des remboursements et feuilles de maladie
        </p>
        <Image
          src="/Illustration.png"
          alt="Illustration"
          width={400}
          height={300}
          className="object-contain w-full"
        />
      </div>
    </div>
  )
}
