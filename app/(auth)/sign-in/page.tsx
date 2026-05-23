"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSignIn } from "@/features/auth/hooks/use-sign-in";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export default function SignInPage() {
  const { form, onSubmit, isPending, error } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="animate-fade-up">
      {/* Heading */}
      <h1 className="text-[2rem] font-bold tracking-[-0.035em] leading-[1.1] text-foreground">
        Welcome back
      </h1>

      {/* Error banner */}
      {error && (
        <div className="mt-5 rounded-lg px-4 py-3 text-[13px] bg-error-subtle border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-[12px] font-medium text-text-secondary"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email")}
            className="h-11 text-[13.5px] bg-card border-[1.5px] border-border text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/12 rounded-[10px] transition-colors"
          />
          {errors.email && (
            <p className="text-[11px] text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-[12px] font-medium text-text-secondary"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-[11.5px] text-primary hover:text-primary-hover underline underline-offset-2 transition-colors duration-150"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
              className="h-11 pr-10 text-[13.5px] bg-card border-[1.5px] border-border text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary/12 rounded-[10px] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-150"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 text-[15px] font-semibold tracking-[-0.01em] rounded-[10px] mt-1 bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground transition-colors duration-150 disabled:opacity-60 font-heading"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
}
