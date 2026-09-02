import { Node, mergeAttributes } from "@tiptap/core";

function isSafeVideoSrc(src) {
  if (typeof src !== "string") return false;
  try {
    const url = new URL(src, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: "Video" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-video-embed]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const src = isSafeVideoSrc(HTMLAttributes.src) ? HTMLAttributes.src : null;
    if (!src) {
      return ["div", { "data-video-embed": "true" }, "Video unavailable"];
    }
    return [
      "div",
      mergeAttributes({ "data-video-embed": "true", style: "margin:10px 0;" }),
      ["video", { controls: "true", src, style: "width:100%;max-height:360px;border-radius:8px;background:#000;" }],
    ];
  },
});

export default VideoEmbed;