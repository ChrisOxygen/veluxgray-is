"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ZSignInSchema, type ZSignIn } from "@/features/auth/schemas/auth-schemas";
import { createClient } from "@/shared/lib/supabase/client";

export function useSignIn() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ZSignIn>({
    resolver: zodResolver(ZSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setIsPending(true);
    setError(null);

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(authError.message);
      setIsPending(false);
      return;
    }

    router.push("/");
    setIsPending(false);
  });

  return { form, onSubmit, isPending, error };
}
