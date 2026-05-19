import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { AuthMobileHeader } from "@/features/auth/components/auth-mobile-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="lg:h-screen lg:overflow-hidden grid lg:grid-cols-[9fr_11fr]">
      {/* Left — brand panel (desktop only) */}
      <div className="hidden lg:flex lg:h-full">
        <AuthBrandPanel />
      </div>

      {/* Mobile-only fixed header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-50 bg-accent/90 backdrop-blur-sm border-b border-border px-6 py-3">
        <AuthMobileHeader />
      </div>

      {/* Right — form area */}
      <div className="bg-accent-subtle min-h-screen lg:h-full lg:overflow-y-auto flex items-center justify-center px-8 pt-28 pb-12 lg:py-12 sm:px-12">
        <div className="w-full max-w-100">
          {children}
        </div>
      </div>
    </div>
  );
}
