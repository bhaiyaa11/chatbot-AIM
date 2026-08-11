import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Canvas from "./Canvas.jsx";
import { showToast } from "./toast.js";
import "./Canvas.css";


// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/*
 * Wrap this around <Canvas canvasId={id} /> at the route level, e.g.
 *
 *   <Route path="/canvas/:canvasId" element={<CanvasAccessGate />} />
 *
 * and read canvasId from useParams() in your router, passing it down.
 * Here it's accepted as a prop so it works with any router setup.
 */
function CanvasAccessGate({ canvasId }) {
  const { session, loading: authLoading } = useAuth();

  const [status, setStatus] = useState(null); // access-status response
  const [checking, setChecking] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState(null);

  const authHeaders = () => {
    const token = session?.access_token;
    if (!token) return null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const checkAccess = async () => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;

    try {
      setChecking(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/access-status`, {
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to check access");
      setStatus(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to check access");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!session?.access_token) {
      setChecking(false);
      return;
    }
    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, authLoading, canvasId]);

  const submitRequest = async () => {
    const headers = authHeaders();
    if (!canvasId || !headers) return;

    try {
      setRequesting(true);
      const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/access-requests`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Failed to request access");
      setRequested(true);
      setStatus((prev) => (prev ? { ...prev, request_status: "pending" } : prev));
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to request access");
    } finally {
      setRequesting(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div className="canvas-gate">
        <p>Loading…</p>
      </div>
    );
  }

  if (!session?.access_token) {
    return (
      <div className="canvas-gate">
        <p>Please sign in to open this canvas.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="canvas-gate">
        <p>{error}</p>
      </div>
    );
  }

  if (status?.has_access) {
    return <Canvas canvasId={canvasId} accessLevel={status.access_level} />;
  }

  const requestStatus = status?.request_status;

  return (
    <div className="canvas-gate">
      <div className="canvas-gate-card">
        <h2>{status?.title || "This canvas"}</h2>

        {requestStatus === "pending" || requested ? (
          <>
            <p>
              Your request to access this canvas is pending. The owner will
              be notified.
            </p>
          </>
        ) : requestStatus === "rejected" ? (
          <>
            <p>Your previous request was denied.</p>
            <button
              type="button"
              className="canvas-gate-request-btn"
              onClick={submitRequest}
              disabled={requesting}
            >
              {requesting ? "Requesting…" : "Request access again"}
            </button>
          </>
        ) : (
          <>
            <p>You don't have access to this canvas yet.</p>
            <button
              type="button"
              className="canvas-gate-request-btn"
              onClick={submitRequest}
              disabled={requesting}
            >
              {requesting ? "Requesting…" : "Request access"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CanvasAccessGate;