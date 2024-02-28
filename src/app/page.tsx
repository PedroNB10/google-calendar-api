"use client";
import Image from "next/image";

import {
  useSession,
  useSessionContext,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import { createClient } from "@supabase/supabase-js";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";

import { type AppProps } from "next/app";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { use, useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function Home() {
  const [session, setSession] = useState<Session>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session || undefined);
      console.log(session?.user.email);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session || undefined);
    });

    return () => subscription.unsubscribe();
  }, []);

  // const session = useSession();

  // console.log(session?.user);

  const googleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/calendar",
        },
      });

      if (error) {
        console.error("Error signing in with Google:", error);
      }
    } catch (error) {
      console.error("Unexpected error during Google sign-in:", error);
    }
  };

  async function signOut() {
    await supabase.auth.signOut();
  }

  const handleSignInClick = () => {
    console.log(session, supabase.auth);

    googleSignIn();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>teste</h1>
      <SessionContextProvider supabaseClient={supabase}>
        <div className="w-[400px] mx-auto my-30 bg-white text-black">
          {session?.user.email ? (
            <div>
              <h1>Olá, {session.user.email}</h1>
              <button onClick={signOut}>Sair</button>
            </div>
          ) : (
            <button onClick={handleSignInClick}>Entrar com Google</button>
          )}
        </div>
      </SessionContextProvider>
      <button onClick={handleSignInClick}>botaozin login</button>
    </main>
  );
}
