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
import { send, title } from "process";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function Home() {
  const [session, setSession] = useState<Session>();
  const [isLoading, setIsLoading] = useState(true);
  console.log(new Date().toISOString());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session || undefined);
      console.log(session?.user.user_metadata.full_name);
      console.log(session?.refresh_token);
      setIsLoading(false);
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

  async function createCalendarEvent() {
    const event = {
      summary: "Corte de cabelo",
      description: "teste de evento",

      start: {
        dateTime: "2024-02-28T18:00:00-03:00",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: "2024-02-28T18:45:00-03:00",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: [
        { email: "barbarolling@gmail.com", responseStatus: "needsAction" },
      ],

      sendUpdates: "all",
    };
    console.log("createCalendarEvent");
    console.log(session?.provider_token);
    console.log(session?.expires_at);

    await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.provider_token}`,

          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    )
      .then((data) => {
        return data;
      })
      .then((data) => {
        console.log(data);
        console.log(data.status);
        alert("Evento criado com sucesso");
      });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>teste</h1>
      <SessionContextProvider supabaseClient={supabase}>
        <div className="w-[400px] mx-auto my-30 bg-white text-black">
          {isLoading ? <div>Carregando...</div> : <div>PRONTO</div>}

          {session?.user.email ? (
            <div>
              <h1>Olá, {session.user.user_metadata.full_name}</h1>
              <button onClick={signOut}>Sair</button>
            </div>
          ) : (
            <button onClick={handleSignInClick}>Entrar com Google</button>
          )}
        </div>
      </SessionContextProvider>
      <button onClick={handleSignInClick}>botaozin login</button>

      <button onClick={createCalendarEvent}>Criar evento no calendar</button>
    </main>
  );
}
