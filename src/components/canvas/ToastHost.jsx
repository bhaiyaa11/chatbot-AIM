import { useState, useEffect, useRef } from "react";
import { subscribeToast } from "./toast.js";

function ToastHost() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  useEffect(() => {
    const unsubscribe = subscribeToast((toast) => {
      setToasts((prev) => [...prev, toast]);
      timers.current[toast.id] = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
        delete timers.current[toast.id];
      }, 4000);
    });

    const timersAtMount = timers.current;
    return () => {
      unsubscribe();
      Object.values(timersAtMount).forEach(clearTimeout);
    };
  }, []);

  const dismiss = (id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="canvas-toast-host">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`canvas-toast canvas-toast-${t.type}`}
          onClick={() => dismiss(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default ToastHost;