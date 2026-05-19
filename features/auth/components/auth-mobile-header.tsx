import Image from "next/image";

export function AuthMobileHeader() {
  return (
    <Image
      src="/assets/logo-gold-black.png"
      alt="Velux Gray"
      width={120}
      height={36}
      className="object-contain"
      priority
    />
  );
}
