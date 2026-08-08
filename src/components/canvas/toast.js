let listeners = [];
let idCounter = 0;

/*
 * showToast("Something went wrong", "error")
 * Types: "error" | "success" | "info"
 * No provider needed — components just import and call this directly.
 * Mount <ToastHost /> once near the root of whichever surface you're
 * on (CanvasWorkspace for the authed app, PublicCanvas for the public
 * page) to actually render them.
 */
export function showToast(message, type = "error") {
  const toast = { id: ++idCounter, message, type };
  listeners.forEach((fn) => fn(toast));
}

export function subscribeToast(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}