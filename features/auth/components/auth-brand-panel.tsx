import Image from "next/image";

export function AuthBrandPanel() {
  return (
    <div className="relative w-full h-full bg-primary flex flex-col overflow-hidden">
      {/* Subtle radial glows */}
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-24 size-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 px-12 pt-10">
        <Image
          src="/assets/logo-gold-white.png"
          alt="Velux Gray"
          width={160}
          height={48}
          className="object-contain"
          priority
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-12 pb-16">
        <div className="w-8 h-0.5 bg-accent mb-8 rounded-full" />
        <h2 className="text-[2.75rem] font-bold text-primary-foreground leading-[1.12] tracking-[-0.035em] max-w-68">
          Luxury refined. Operations perfected.
        </h2>
        <p className="mt-5 text-[13.5px] text-primary-foreground/45 max-w-[20rem] leading-[1.65]">
          Your internal hub for inventory, leads, and customer workflows — built for Velux Gray.
        </p>

        <div className="mt-12 flex flex-col gap-3">
          {[
            "Inventory tracked in real time",
            "Lead pipeline at a glance",
            "Automated WhatsApp follow-ups",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="size-1.5 rounded-full bg-accent shrink-0" />
              <span className="text-[13px] text-primary-foreground/55">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-accent/40 to-transparent" />
    </div>
  );
}
