import { Node, mergeAttributes } from "@tiptap/core";

// Only allow http(s) sources — blocks javascript:, data:, and other
// schemes that could be smuggled in through a pasted/edited doc.
function isSafeAudioSrc(src) {
  if (typeof src !== "string") return false;
  try {
    const url = new URL(src, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const AudioEmbed = Node.create({
  name: "audioEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: "Voice Over" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-audio-embed]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const src = isSafeAudioSrc(HTMLAttributes.src) ? HTMLAttributes.src : null;

    if (!src) {
      return ["div", { "data-audio-embed": "true" }, "Audio unavailable"];
    }

    return [
      "div",
      mergeAttributes({ "data-audio-embed": "true", style: "margin:10px 0;" }),
      [
        "div",
        { style: "font-size:11px;color:rgba(255,255,255,.4);margin-bottom:4px;font-family:'Inter',sans-serif;" },
        HTMLAttributes.title || "Voice Over",
      ],
      ["audio", { controls: "true", src, style: "width:100%;" }],
    ];
  },
});

export default AudioEmbed;