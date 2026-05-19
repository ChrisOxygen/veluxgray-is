"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ZSignInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type ZSignIn = z.infer<typeof ZSignInSchema>;

export function useSignIn() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ZSignIn>({
    resolver: zodResolver(ZSignInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setIsPending(true);
    setError(null);
    try {
      // TODO: wire Supabase auth once env vars are configured
      // const supabase = createClient();
      // const { error } = await supabase.auth.signInWithPassword(data);
      // if (error) throw new Error(error.message);
      // router.push("/");
      console.log("Sign in:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  });

  function signInWithGoogle() {
    // TODO: wire Supabase OAuth once env vars are configured
    // const supabase = createClient();
    // supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/` } });
  }

  return { form, onSubmit, isPending, error, signInWithGoogle };
}
