import "./sheader.css";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const ALLOWED_DOMAIN = "allinmotion.com"; // change to your company domain

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

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const user = session?.user;

  return (
    <div
      className="top"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* LEFT: LOGO */}
      <div className="sheader">
        <img
          src="51501-24-AiM-LOGO_White.png"
          alt="Logo"
          style={{ border: "10px solid transparent", width: "150px", height: "100%" }}
        />
      </div>

      {/* CENTER: TITLE */}
      <div className="title">
        {/* <p>AllinMotion</p> */}
        <p>ALL IN MOTION</p>
      </div>

      {/* RIGHT: USER PROFILE / LOGIN */}
      <div className="user_profile">
        {user ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <div className="sheader-avatar">
              {user.email[0].toUpperCase()}
            </div>
            <span className="sheader-email">{user.email}</span>
            <button className="sheader-btn-signout" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: "inline-flex", gap: "8px" }}>
            <input
              className="sheader-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="sheader-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="sheader-btn-signin" onClick={handleLogin}>
              Sign In
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="sheader-error">{error}</p>
      )}
    </div>
  );
}