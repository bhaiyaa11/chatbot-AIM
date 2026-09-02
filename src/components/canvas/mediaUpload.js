const API_BASE_URL = "http://127.0.0.1:8000";
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
export const ACCEPTED_AUDIO_TYPES = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/ogg"];

export function classifyFile(file) {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return "image";
  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return "video";
  if (ACCEPTED_AUDIO_TYPES.includes(file.type)) return "audio";
  return null;
}

export async function uploadCanvasMedia(canvasId, authHeaders, file) {
  const headers = authHeaders();
  if (!headers) throw new Error("Not authenticated");
  if (!canvasId) throw new Error("No canvas to upload to");
  if (!classifyFile(file)) throw new Error("Unsupported file type");

  const form = new FormData();
  form.append("file", file);

  const { "Content-Type": _drop, ...uploadHeaders } = headers;

  const res = await fetch(`${API_BASE_URL}/canvas/${canvasId}/media`, {
    method: "POST",
    headers: uploadHeaders,
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || "Upload failed");
  return data.media;
}