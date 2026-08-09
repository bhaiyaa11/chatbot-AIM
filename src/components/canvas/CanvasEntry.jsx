import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { supabase } from "../../supabase.js";
import CanvasAccessGate from "./CanvasAccessGate.jsx";
import ToastHost from "./ToastHost.jsx";
import { showToast } from "./toast.js";
import "./Canvas.css";

/*
 * Entry point for restricted-canvas share links
 * (yourapp.com/canvas-access/{canvasId}).
 *
 * If there's already a session (owner testing their own link, or a
 * previously-verified client returning), skip straight to the normal
 * access-gated Canvas. Otherwise: email -> one-time code -> verified
 * session, via Supabase's passwordless OTP. Verifying the code *is*
 * account creation — nothing separate to build. Once verified,
 * get_canvas_access on the backend transparently checks for a
 * matching invite and grants access, or falls through to the
 * existing request-access screen if this email wasn't invited.
 */
function CanvasEntry({ canvasId }) {
  const { session, loading } = useAuth();

  const [step, setStep] = useState("email"); // "email" | "code"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (loading) {
    return (
      <div className="canvas-gate">
        <p>Loading…</p>
      </div>
    );
  }

  if (session?.access_token) {
    return <CanvasAccessGate canvasId={canvasId} />;
  }

  const sendCode = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    try {
      setSending(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          shouldCreateUser: true,
          // If they click the link instead of typing the code (e.g.
          // the email template's still just the default link), send
          // them back to this exact canvas, not the project's default
          // Site URL / homepage.
          emailRedirectTo: window.location.href,
        },
      });
      if (error) throw error;
      setStep("code");
    } catch (err) {
      console.error("Failed to send code:", err);
      showToast(err.message || "Failed to send code");
    } finally {
      setSending(false);
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    try {
      setVerifying(true);
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: trimmed,
        type: "email",
      });
      if (error) throw error;
      // AuthContext's onAuthStateChange picks up the new session
      // automatically — this component re-renders and the branch
      // above takes over.
    } catch (err) {
      console.error("Failed to verify code:", err);
      showToast(err.message || "That code didn't work — check it and try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="canvas-gate">
      <div className="canvas-gate-card">
        <h2>Enter your email to continue</h2>

        {step === "email" && (
          <form onSubmit={sendCode}>
            <p>We'll send a one-time code — no password needed.</p>
            <input
              type="email"
              className="canvas-gate-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
            <button
              type="submit"
              className="canvas-gate-request-btn"
              disabled={sending || !email.trim()}
            >
              {sending ? "Sending…" : "Send code"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={verifyCode}>
            <p>Code sent to {email}. Check your inbox.</p>
            <input
              type="text"
              inputMode="numeric"
              className="canvas-gate-input"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              required
            />
            <button
              type="submit"
              className="canvas-gate-request-btn"
              disabled={verifying || !code.trim()}
            >
              {verifying ? "Verifying…" : "Verify"}
            </button>
            <button
              type="button"
              className="canvas-gate-link-btn"
              onClick={() => {
                setStep("email");
                setCode("");
              }}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>

      <ToastHost />
    </div>
  );
}

export default CanvasEntry;