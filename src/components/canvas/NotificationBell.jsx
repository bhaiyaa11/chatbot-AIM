
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";

// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LABELS = {
  access_request: "requested access to your canvas",
  access_approved: "approved your access request",
  access_denied: "denied your access request",
  added_to_canvas: "gave you access to a canvas",
};

function NotificationBell() {
  const { session } = useAuth();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const authHeaders = () => {
    const token = session?.access_token;

    if (!token) return null;

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const load = async () => {
    const headers = authHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers,
      });

      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const handleBellClick = () => {
    if (!open) {
      load();
    }

    setOpen((v) => !v);
  };

  const markRead = async (id) => {
    const headers = authHeaders();
    if (!headers) return;

    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "POST",
        headers,
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read: true }
            : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

return (
  <div className="canvas-notification-wrapper">
    <button
      type="button"
      className="canvas-notification-bell"
      onClick={() => {
        if (!open) {
          load();
        }

        setOpen((v) => !v);
      }}
    >
      {/* <NotificationsOutlinedIcon fontSize="small" /> */}
      <NotificationsOutlinedIcon fontSize="small" style={{ color: "#fff" }} />

      {unreadCount > 0 && (
        <span className="canvas-notification-badge">
          {unreadCount}
        </span>
      )}
    </button>

    {open && (
      <div className="canvas-notification-panel">
        <div className="canvas-notification-panel-header">
          Notifications
        </div>

        {notifications.length === 0 && (
          <p className="canvas-share-hint">
            Nothing yet.
          </p>
        )}

        {notifications.map((n) => (
          <button
            type="button"
            key={n.id}
            className={`canvas-notification-item ${
              n.read ? "" : "unread"
            }`}
            onClick={() => markRead(n.id)}
          >
            <span>
              {LABELS[n.type] || n.type}
            </span>

            <span className="canvas-notification-time">
              {new Date(n.created_at).toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
);
}

export default NotificationBell;