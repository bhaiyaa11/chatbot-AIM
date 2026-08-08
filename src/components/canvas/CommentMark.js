import { Mark, mergeAttributes } from "@tiptap/core";

/*
 * Marks a text range as having a comment thread attached.
 * The mark itself carries no comment content — it just stores the
 * comment's id so a click can look the thread up in the comments list.
 * Because it's a real Tiptap mark, it's saved as part of the doc JSON
 * and persists automatically through the existing autosave.
 */
export const CommentMark = Mark.create({
  name: "comment",

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-comment-id"),
        renderHTML: (attrs) => {
          if (!attrs.commentId) return {};
          return { "data-comment-id": attrs.commentId };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-comment-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { class: "canvas-comment-highlight" }),
      0,
    ];
  },

  addCommands() {
    return {
      setComment:
        (commentId) =>
        ({ commands }) =>
          commands.setMark(this.name, { commentId }),
      unsetComment:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

export default CommentMark;