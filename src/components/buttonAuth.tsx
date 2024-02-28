import React from "react";
interface Iprops {
  supabase: any;
}

async function buttonAuth(props: Iprops) {
  const googleSignIn = async () => {
    try {
      const { error } = await props.supabase.auth.signInWithOAuth({
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

  if (props.supabase.auth) {
    googleSignIn();
  }

  return <div>buttonAuth</div>;
}

export default buttonAuth;
