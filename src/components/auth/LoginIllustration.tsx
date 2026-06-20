/** Stéthoscope stylisé — charte prune / sable-gold. */
export default function LoginIllustration() {
  return (
    <svg
      viewBox="0 0 280 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[220px] opacity-90"
      aria-hidden
    >
      {/* Tubes des écouteurs */}
      <path
        d="M88 52 C88 28, 112 16, 140 16 C168 16, 192 28, 192 52"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-sable-gold/80"
      />
      {/* Écouteurs */}
      <circle cx="88" cy="56" r="10" stroke="currentColor" strokeWidth="2.5" className="text-sable-gold" />
      <circle cx="192" cy="56" r="10" stroke="currentColor" strokeWidth="2.5" className="text-sable-gold" />
      <circle cx="88" cy="56" r="4" fill="currentColor" className="text-sable-gold/50" />
      <circle cx="192" cy="56" r="4" fill="currentColor" className="text-sable-gold/50" />

      {/* Tube principal */}
      <path
        d="M140 52 V120 C140 148, 118 168, 96 176"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="text-sable-gold/90"
      />
      <path
        d="M140 120 C140 148, 162 168, 184 176"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="text-sable-gold/90"
      />

      {/* Tube flexible vers la poitrine */}
      <path
        d="M140 120 C140 155, 132 185, 140 210"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="text-sable-gold"
      />

      {/* Poitrine (membrane) */}
      <circle cx="140" cy="214" r="22" stroke="currentColor" strokeWidth="2.5" className="text-sable-gold" />
      <circle cx="140" cy="214" r="14" stroke="currentColor" strokeWidth="1.5" className="text-sable-gold/60" />
      <circle cx="140" cy="214" r="6" fill="currentColor" className="text-sable-gold/40" />

      {/* Reflet décoratif */}
      <path
        d="M48 200 C70 188, 210 188, 232 200"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        className="text-prune-light/15"
      />
    </svg>
  )
}
