import "./sheader.css";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";


const ALLOWED_DOMAIN = "gmail.com"; // change to your company domain

export default function Sheader() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Load session + listen to auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setError(null);

    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError("Only company email addresses are allowed.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const user = session?.user;

  return (
    <div className="top">
      {/* LEFT: TITLE */}
      <div className="sheader">
        <h2>ALLINMOTION</h2>
      </div>
      {/* RIGHT: USER PROFILE / LOGIN */}
      <div className="user_profile">
        {user ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
            {/* Avatar fallback (Supabase doesn’t provide photoURL by default) */}
            <div
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                backgroundColor: "#000",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
              }}
            >
              {user.email[0].toUpperCase()}
            </div>

            <span>{user.email}</span>

            <button
              style={{
                backgroundColor: "black",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: "inline-flex", gap: "8px" }}>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              style={{
                backgroundColor: "black",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleLogin}
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: "red", position: "absolute", top: "60px", right: "20px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
