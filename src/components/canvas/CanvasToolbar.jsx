import { useState, useRef, useEffect } from "react";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
import FormatUnderlinedRoundedIcon from "@mui/icons-material/FormatUnderlinedRounded";
import StrikethroughSRoundedIcon from "@mui/icons-material/StrikethroughSRounded";
import FormatColorTextRoundedIcon from "@mui/icons-material/FormatColorTextRounded";
import FormatColorFillRoundedIcon from "@mui/icons-material/FormatColorFillRounded";
import FormatAlignLeftRoundedIcon from "@mui/icons-material/FormatAlignLeftRounded";
import FormatAlignCenterRoundedIcon from "@mui/icons-material/FormatAlignCenterRounded";
import FormatAlignRightRoundedIcon from "@mui/icons-material/FormatAlignRightRounded";
import FormatAlignJustifyRoundedIcon from "@mui/icons-material/FormatAlignJustifyRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import FormatIndentIncreaseRoundedIcon from "@mui/icons-material/FormatIndentIncreaseRounded";
import FormatIndentDecreaseRoundedIcon from "@mui/icons-material/FormatIndentDecreaseRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
import FormatClearRoundedIcon from "@mui/icons-material/FormatClearRounded";

const TEXT_COLORS = ["#ffffff", "#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#94a3b8"];
const HIGHLIGHT_COLORS = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#e9d5ff", "#fecaca"];

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

function ToolbarButton({ onClick, active, disabled, children, title }) {
  return (
    <button
      type="button"
      className={`canvas-toolbar-button ${active ? "active" : ""}`}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={disabled ? { opacity: 0.35, cursor: "default" } : undefined}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="canvas-toolbar-divider" />;
}

/* ── Block-style dropdown (Normal / H1-H3 / Quote) ───────────── */
function HeadingDropdown({ editor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const options = [
    { label: "Normal text", size: "12px", weight: 400, test: () => !editor.isActive("heading") && !editor.isActive("blockquote"), action: () => editor.chain().focus().setParagraph().run() },
    { label: "Heading 1", size: "17px", weight: 700, test: () => editor.isActive("heading", { level: 1 }), action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: "Heading 2", size: "15px", weight: 700, test: () => editor.isActive("heading", { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Heading 3", size: "13px", weight: 600, test: () => editor.isActive("heading", { level: 3 }), action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Quote", size: "12px", weight: 400, test: () => editor.isActive("blockquote"), action: () => editor.chain().focus().toggleBlockquote().run() },
  ];

  const current = options.find((o) => o.test()) || options[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "6px", justifyContent: "space-between",
          background: open ? "rgba(255,255,255,.08)" : "none",
          border: "1px solid rgba(255,255,255,.1)", borderRadius: "6px",
          color: "rgba(255,255,255,.75)", fontSize: "11.5px", fontFamily: "'Inter',sans-serif",
          padding: "5px 10px", cursor: "pointer", minWidth: "108px",
        }}
      >
        {current.label}
        <span style={{ fontSize: "9px", opacity: 0.6 }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30,
            background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,.5)", minWidth: "150px", padding: "4px",
          }}
        >
          {options.map((o) => (
            <button
              key={o.label}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { o.action(); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                background: o.test() ? "rgba(255,255,255,.08)" : "none", border: "none",
                borderRadius: "5px", color: "rgba(255,255,255,.85)",
                fontSize: o.size, fontWeight: o.weight, fontFamily: "'Inter',sans-serif",
                padding: "6px 8px", cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Text color / highlight swatch dropdown ──────────────────── */
function ColorDropdown({ editor, mode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const palette = mode === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS;

  const applyColor = (color) => {
    if (mode === "text") editor.chain().focus().setColor(color).run();
    else editor.chain().focus().toggleHighlight({ color }).run();
    setOpen(false);
  };

  const clear = () => {
    if (mode === "text") editor.chain().focus().unsetColor().run();
    else editor.chain().focus().unsetHighlight().run();
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <ToolbarButton title={mode === "text" ? "Text color" : "Highlight color"} active={open} onClick={() => setOpen((v) => !v)}>
        {mode === "text" ? <FormatColorTextRoundedIcon sx={{ fontSize: 17 }} /> : <FormatColorFillRoundedIcon sx={{ fontSize: 17 }} />}
      </ToolbarButton>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30,
            background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,.5)", padding: "8px",
            display: "grid", gridTemplateColumns: "repeat(4, 20px)", gap: "6px", width: "116px",
          }}
        >
          {palette.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyColor(c)}
              title={c}
              style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,.25)", cursor: "pointer" }}
            />
          ))}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
            style={{
              gridColumn: "span 4", marginTop: "4px", background: "none",
              border: "1px solid rgba(255,255,255,.1)", borderRadius: "5px",
              color: "rgba(255,255,255,.5)", fontSize: "10px", padding: "3px 0", cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Link popover ─────────────────────────────────────────────── */
function LinkButton({ editor }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const openPopover = () => {
    setValue(editor.getAttributes("link").href || "");
    setOpen(true);
  };

  const apply = () => {
    const url = value.trim();
    if (!url) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <ToolbarButton title="Insert link" active={editor.isActive("link")} onClick={openPopover}>
        <LinkRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30,
            background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,.5)", padding: "8px", display: "flex", gap: "6px", width: "220px",
          }}
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") apply();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="https://…"
            style={{
              flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: "5px", color: "rgba(255,255,255,.85)", fontSize: "11px", padding: "5px 7px", outline: "none",
            }}
          />
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={apply}
            style={{
              background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)",
              borderRadius: "5px", color: "rgba(255,255,255,.9)", fontSize: "11px", padding: "0 10px", cursor: "pointer",
            }}
          >
            Set
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Main toolbar ─────────────────────────────────────────────── */
function CanvasToolbar({ editor }) {
  if (!editor) return null;

  const canIndent = editor.isActive("listItem") || editor.isActive("taskItem");

  return (
    <div className="canvas-format-toolbar" style={{ display: "flex", alignItems: "center", gap: "3px", flexWrap: "wrap" }}>
      <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <UndoRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <RedoRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>

      <Divider />

      <HeadingDropdown editor={editor} />

      <Divider />

      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <FormatBoldRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <FormatItalicRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <FormatUnderlinedRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <StrikethroughSRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>

      <ColorDropdown editor={editor} mode="text" />
      <ColorDropdown editor={editor} mode="highlight" />

      <Divider />

      <ToolbarButton title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <FormatAlignLeftRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <FormatAlignCenterRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <FormatAlignRightRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <FormatAlignJustifyRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <FormatListBulletedRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <FormatListNumberedRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Checklist" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <ChecklistRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>

      <ToolbarButton
        title="Decrease indent"
        disabled={!canIndent}
        onClick={() => {
          if (editor.isActive("taskItem")) editor.chain().focus().liftListItem("taskItem").run();
          else editor.chain().focus().liftListItem("listItem").run();
        }}
      >
        <FormatIndentDecreaseRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton
        title="Increase indent"
        disabled={!canIndent}
        onClick={() => {
          if (editor.isActive("taskItem")) editor.chain().focus().sinkListItem("taskItem").run();
          else editor.chain().focus().sinkListItem("listItem").run();
        }}
      >
        <FormatIndentIncreaseRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>

      <Divider />

      <LinkButton editor={editor} />
      <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <FormatQuoteRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <CodeRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
      <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <HorizontalRuleRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <FormatClearRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>
    </div>
  );
}

export default CanvasToolbar;