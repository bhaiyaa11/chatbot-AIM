// import { useState, useRef, useEffect } from "react";
// import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
// import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
// import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
// import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
// import FormatUnderlinedRoundedIcon from "@mui/icons-material/FormatUnderlinedRounded";
// import StrikethroughSRoundedIcon from "@mui/icons-material/StrikethroughSRounded";
// import FormatColorTextRoundedIcon from "@mui/icons-material/FormatColorTextRounded";
// import FormatColorFillRoundedIcon from "@mui/icons-material/FormatColorFillRounded";
// import FormatAlignLeftRoundedIcon from "@mui/icons-material/FormatAlignLeftRounded";
// import FormatAlignCenterRoundedIcon from "@mui/icons-material/FormatAlignCenterRounded";
// import FormatAlignRightRoundedIcon from "@mui/icons-material/FormatAlignRightRounded";
// import FormatAlignJustifyRoundedIcon from "@mui/icons-material/FormatAlignJustifyRounded";
// import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
// import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
// import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
// import FormatIndentIncreaseRoundedIcon from "@mui/icons-material/FormatIndentIncreaseRounded";
// import FormatIndentDecreaseRoundedIcon from "@mui/icons-material/FormatIndentDecreaseRounded";
// import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
// import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
// import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
// import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
// import FormatClearRoundedIcon from "@mui/icons-material/FormatClearRounded";
// import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
// import ImageRoundedIcon from "@mui/icons-material/ImageRounded";

// const TEXT_COLORS = ["#ffffff", "#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#94a3b8"];
// const HIGHLIGHT_COLORS = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#e9d5ff", "#fecaca"];

// // Only allow http(s) image sources. Explicitly reject data:/javascript:/etc,
// // since a `data:` or `javascript:` "image" URL saved into the doc is a
// // stored-XSS vector for anyone who later views this canvas.
// function isSafeImageUrl(value) {
//   try {
//     const url = new URL(value.trim());
//     return url.protocol === "http:" || url.protocol === "https:";
//   } catch {
//     return false;
//   }
// }

// function useClickOutside(ref, onOutside) {
//   useEffect(() => {
//     const handler = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) onOutside();
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [ref, onOutside]);
// }

// function ToolbarButton({ onClick, active, disabled, children, title }) {
//   return (
//     <button
//       type="button"
//       className={`canvas-toolbar-button ${active ? "active" : ""}`}
//       onMouseDown={(e) => e.preventDefault()}
//       onClick={onClick}
//       disabled={disabled}
//       title={title}
//       aria-label={title}
//       style={disabled ? { opacity: 0.35, cursor: "default" } : undefined}
//     >
//       {children}
//     </button>
//   );
// }

// function Divider() {
//   return <div className="canvas-toolbar-divider" />;
// }

// /* ── Block-style dropdown (Normal / H1-H3 / Quote) ───────────── */
// function HeadingDropdown({ editor }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);
//   useClickOutside(ref, () => setOpen(false));

//   const options = [
//     { label: "Normal text", size: "12px", weight: 400, test: () => !editor.isActive("heading") && !editor.isActive("blockquote"), action: () => editor.chain().focus().setParagraph().run() },
//     { label: "Heading 1", size: "17px", weight: 700, test: () => editor.isActive("heading", { level: 1 }), action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
//     { label: "Heading 2", size: "15px", weight: 700, test: () => editor.isActive("heading", { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
//     { label: "Heading 3", size: "13px", weight: 600, test: () => editor.isActive("heading", { level: 3 }), action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
//     { label: "Quote", size: "12px", weight: 400, test: () => editor.isActive("blockquote"), action: () => editor.chain().focus().toggleBlockquote().run() },
//   ];

//   const current = options.find((o) => o.test()) || options[0];

//   return (
//     <div ref={ref} style={{ position: "relative" }}>
//       <button
//         type="button"
//         onMouseDown={(e) => e.preventDefault()}
//         onClick={() => setOpen((v) => !v)}
//         aria-label="Text style"
//         style={{
//           display: "flex", alignItems: "center", gap: "6px", justifyContent: "space-between",
//           background: open ? "rgba(255,255,255,.08)" : "none",
//           border: "1px solid rgba(255,255,255,.1)", borderRadius: "6px",
//           color: "rgba(255,255,255,.75)", fontSize: "11.5px", fontFamily: "'Inter',sans-serif",
//           padding: "5px 10px", cursor: "pointer", minWidth: "108px",
//         }}
//       >
//         {current.label}
//         <span style={{ fontSize: "9px", opacity: 0.6 }}>▾</span>
//       </button>

//       {open && (
//         <div
//           style={{
//             position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30,
//             background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
//             boxShadow: "0 8px 24px rgba(0,0,0,.5)", minWidth: "150px", padding: "4px",
//           }}
//         >
//           {options.map((o) => (
//             <button
//               key={o.label}
//               type="button"
//               onMouseDown={(e) => e.preventDefault()}
//               onClick={() => { o.action(); setOpen(false); }}
//               style={{
//                 display: "block", width: "100%", textAlign: "left",
//                 background: o.test() ? "rgba(255,255,255,.08)" : "none", border: "none",
//                 borderRadius: "5px", color: "rgba(255,255,255,.85)",
//                 fontSize: o.size, fontWeight: o.weight, fontFamily: "'Inter',sans-serif",
//                 padding: "6px 8px", cursor: "pointer",
//               }}
//             >
//               {o.label}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ── Text color / highlight swatch dropdown ──────────────────── */
// function ColorDropdown({ editor, mode }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);
//   useClickOutside(ref, () => setOpen(false));
//   const palette = mode === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS;

//   const applyColor = (color) => {
//     if (mode === "text") editor.chain().focus().setColor(color).run();
//     else editor.chain().focus().toggleHighlight({ color }).run();
//     setOpen(false);
//   };

//   const clear = () => {
//     if (mode === "text") editor.chain().focus().unsetColor().run();
//     else editor.chain().focus().unsetHighlight().run();
//     setOpen(false);
//   };

//   return (
//     <div ref={ref} style={{ position: "relative" }}>
//       <ToolbarButton title={mode === "text" ? "Text color" : "Highlight color"} active={open} onClick={() => setOpen((v) => !v)}>
//         {mode === "text" ? <FormatColorTextRoundedIcon sx={{ fontSize: 17 }} /> : <FormatColorFillRoundedIcon sx={{ fontSize: 17 }} />}
//       </ToolbarButton>

//       {open && (
//         <div
//           style={{
//             position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30,
//             background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
//             boxShadow: "0 8px 24px rgba(0,0,0,.5)", padding: "8px",
//             display: "grid", gridTemplateColumns: "repeat(4, 20px)", gap: "6px", width: "116px",
//           }}
//         >
//           {palette.map((c) => (
//             <button
//               key={c}
//               type="button"
//               onMouseDown={(e) => e.preventDefault()}
//               onClick={() => applyColor(c)}
//               title={c}
//               aria-label={`Set color ${c}`}
//               style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "1px solid rgba(255,255,255,.25)", cursor: "pointer" }}
//             />
//           ))}
//           <button
//             type="button"
//             onMouseDown={(e) => e.preventDefault()}
//             onClick={clear}
//             style={{
//               gridColumn: "span 4", marginTop: "4px", background: "none",
//               border: "1px solid rgba(255,255,255,.1)", borderRadius: "5px",
//               color: "rgba(255,255,255,.5)", fontSize: "10px", padding: "3px 0", cursor: "pointer",
//             }}
//           >
//             Clear
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ── Link popover ─────────────────────────────────────────────── */
// function LinkButton({ editor }) {
//   const [open, setOpen] = useState(false);
//   const [value, setValue] = useState("");
//   const ref = useRef(null);
//   useClickOutside(ref, () => setOpen(false));

//   const openPopover = () => {
//     setValue(editor.getAttributes("link").href || "");
//     setOpen(true);
//   };

//   const apply = () => {
//     const url = value.trim();
//     if (!url) editor.chain().focus().unsetLink().run();
//     else editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
//     setOpen(false);
//   };

//   return (
//     <div ref={ref} style={{ position: "relative" }}>
//       <ToolbarButton title="Insert link" active={editor.isActive("link")} onClick={openPopover}>
//         <LinkRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>

//       {open && (
//         <div
//           style={{
//             position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30,
//             background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
//             boxShadow: "0 8px 24px rgba(0,0,0,.5)", padding: "8px", display: "flex", gap: "6px", width: "220px",
//           }}
//         >
//           <input
//             autoFocus
//             value={value}
//             onChange={(e) => setValue(e.target.value)}
//             onKeyDown={(e) => {
//               if (e.key === "Enter") apply();
//               if (e.key === "Escape") setOpen(false);
//             }}
//             placeholder="https://…"
//             aria-label="Link URL"
//             style={{
//               flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
//               borderRadius: "5px", color: "rgba(255,255,255,.85)", fontSize: "11px", padding: "5px 7px", outline: "none",
//             }}
//           />
//           <button
//             type="button"
//             onMouseDown={(e) => e.preventDefault()}
//             onClick={apply}
//             style={{
//               background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)",
//               borderRadius: "5px", color: "rgba(255,255,255,.9)", fontSize: "11px", padding: "0 10px", cursor: "pointer",
//             }}
//           >
//             Set
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ── Insert table: hover-grid picker (Docs-style) ────────────── */
// function InsertTableButton({ editor }) {
//   const [open, setOpen] = useState(false);
//   const [hover, setHover] = useState({ rows: 0, cols: 0 });
//   const ref = useRef(null);
//   useClickOutside(ref, () => setOpen(false));

//   const MAX_ROWS = 8;
//   const MAX_COLS = 10;

//   const apply = (rows, cols) => {
//     editor
//       .chain()
//       .focus()
//       .insertTable({ rows, cols, withHeaderRow: true })
//       .run();
//     setOpen(false);
//     setHover({ rows: 0, cols: 0 });
//   };

//   return (
//     <div ref={ref} style={{ position: "relative" }}>
//       <ToolbarButton title="Insert table" active={open} onClick={() => setOpen((v) => !v)}>
//         <TableChartRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>

//       {open && (
//         <div
//           style={{
//             position: "absolute", top: "calc(100% + 4px)", right: 5, zIndex: 30,
//             background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
//             boxShadow: "0 8px 24px rgba(0,0,0,.5)", padding: "10px",
//           }}
//         >
//           <div
//             style={{
//               fontSize: "11px", color: "rgba(255,255,255,.6)", marginBottom: "8px",
//               fontFamily: "'Inter',sans-serif",
//             }}
//           >
//             {hover.rows > 0 ? `${hover.rows} × ${hover.cols}` : "Insert table"}
//           </div>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: `repeat(${MAX_COLS}, 16px)`,
//               gridTemplateRows: `repeat(${MAX_ROWS}, 16px)`,
//               gap: "3px",
//             }}
//             onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
//           >
//             {Array.from({ length: MAX_ROWS * MAX_COLS }).map((_, i) => {
//               const r = Math.floor(i / MAX_COLS) + 1;
//               const c = (i % MAX_COLS) + 1;
//               const filled = r <= hover.rows && c <= hover.cols;
//               return (
//                 <div
//                   key={i}
//                   onMouseEnter={() => setHover({ rows: r, cols: c })}
//                   onClick={() => apply(r, c)}
//                   style={{
//                     width: 16, height: 16, borderRadius: "2px", cursor: "pointer",
//                     background: filled ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.08)",
//                     border: "1px solid rgba(255,255,255,.15)",
//                     transition: "background .05s",
//                   }}
//                 />
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ── Contextual table toolbar — only shown when cursor is in a table ── */
// function TableContextToolbar({ editor }) {
//   if (!editor.isActive("table")) return null;

//   return (
//     <div
//       style={{
//         display: "flex", alignItems: "center", gap: "3px", flexWrap: "wrap",
//         padding: "6px 28px", background: "#181818",
//         borderBottom: "1px solid rgba(255,255,255,.05)",
//       }}
//     >
//       <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,.4)", marginRight: "4px", fontFamily: "'Inter',sans-serif" }}>
//         Table
//       </span>

//       <ToolbarButton title="Insert row above" onClick={() => editor.chain().focus().addRowBefore().run()}>Row ↑</ToolbarButton>
//       <ToolbarButton title="Insert row below" onClick={() => editor.chain().focus().addRowAfter().run()}>Row ↓</ToolbarButton>
//       <ToolbarButton title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>Del row</ToolbarButton>

//       <Divider />

//       <ToolbarButton title="Insert column left" onClick={() => editor.chain().focus().addColumnBefore().run()}>Col ←</ToolbarButton>
//       <ToolbarButton title="Insert column right" onClick={() => editor.chain().focus().addColumnAfter().run()}>Col →</ToolbarButton>
//       <ToolbarButton title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>Del col</ToolbarButton>

//       <Divider />

//       <ToolbarButton
//         title="Toggle header row"
//         active={editor.isActive("tableHeader")}
//         onClick={() => editor.chain().focus().toggleHeaderRow().run()}
//       >
//         Header
//       </ToolbarButton>
//       <Divider />

//       <ToolbarButton
//         title="Delete table"
//         onClick={() => editor.chain().focus().deleteTable().run()}
//       >
//         <span style={{ color: "#f87171" }}>Delete table</span>
//       </ToolbarButton>
//     </div>
//   );
// }

// /* ── Insert image popover (URL-based) ────────────────────────── */
// function InsertImageButton({ editor }) {
//   const [open, setOpen] = useState(false);
//   const [value, setValue] = useState("");
//   const [error, setError] = useState("");
//   const ref = useRef(null);
//   useClickOutside(ref, () => {
//     setOpen(false);
//     setError("");
//   });

//   const apply = () => {
//     const url = value.trim();
//     if (!url) return;
//     if (!isSafeImageUrl(url)) {
//       setError("Only http:// or https:// image URLs are allowed.");
//       return;
//     }
//     editor.chain().focus().setImage({ src: url }).run();
//     setOpen(false);
//     setValue("");
//     setError("");
//   };

//   return (
//     <div ref={ref} style={{ position: "relative" }}>
//       <ToolbarButton title="Insert image" active={open} onClick={() => setOpen((v) => !v)}>
//         <ImageRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>

//       {open && (
//         <div
//           style={{
//             position: "absolute", top: "calc(100% + 4px)", right: 5, zIndex: 30,
//             background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
//             boxShadow: "0 8px 24px rgba(0,0,0,.5)", padding: "8px",
//             display: "flex", flexDirection: "column", gap: "6px", width: "220px",
//           }}
//         >
//           <div style={{ display: "flex", gap: "6px" }}>
//             <input
//               autoFocus
//               value={value}
//               onChange={(e) => {
//                 setValue(e.target.value);
//                 if (error) setError("");
//               }}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") apply();
//                 if (e.key === "Escape") setOpen(false);
//               }}
//               placeholder="https://…image.png"
//               aria-label="Image URL"
//               style={{
//                 flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
//                 borderRadius: "5px", color: "rgba(255,255,255,.85)", fontSize: "11px", padding: "5px 7px", outline: "none",
//               }}
//             />
//             <button
//               type="button"
//               onMouseDown={(e) => e.preventDefault()}
//               onClick={apply}
//               style={{
//                 background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)",
//                 borderRadius: "5px", color: "rgba(255,255,255,.9)", fontSize: "11px", padding: "0 10px", cursor: "pointer",
//               }}
//             >
//               Set
//             </button>
//           </div>
//           {error && (
//             <div style={{ fontSize: "10px", color: "#f87171" }}>{error}</div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ── Main toolbar ─────────────────────────────────────────────── */

// function CanvasToolbar({ editor }) {
//   if (!editor) return null;
//   const canIndent = editor.isActive("listItem") || editor.isActive("taskItem");

//   return (
//     <>
//       <div className="canvas-format-toolbar" style={{ display: "flex", alignItems: "center", gap: "3px", flexWrap: "wrap" }}>
//         {/* ...unchanged buttons... */}
//       <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
//         <UndoRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
//         <RedoRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>

//       <Divider />

//       <HeadingDropdown editor={editor} />

//       <Divider />

//       <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
//         <FormatBoldRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
//         <FormatItalicRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
//         <FormatUnderlinedRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
//         <StrikethroughSRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>

//       <ColorDropdown editor={editor} mode="text" />
//       <ColorDropdown editor={editor} mode="highlight" />

//       <Divider />

//       <ToolbarButton title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
//         <FormatAlignLeftRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
//         <FormatAlignCenterRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
//         <FormatAlignRightRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
//         <FormatAlignJustifyRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>

//       <Divider />

//       <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
//         <FormatListBulletedRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
//         <FormatListNumberedRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Checklist" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
//         <ChecklistRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>

//       <ToolbarButton
//         title="Decrease indent"
//         disabled={!canIndent}
//         onClick={() => {
//           if (editor.isActive("taskItem")) editor.chain().focus().liftListItem("taskItem").run();
//           else editor.chain().focus().liftListItem("listItem").run();
//         }}
//       >
//         <FormatIndentDecreaseRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton
//         title="Increase indent"
//         disabled={!canIndent}
//         onClick={() => {
//           if (editor.isActive("taskItem")) editor.chain().focus().sinkListItem("taskItem").run();
//           else editor.chain().focus().sinkListItem("listItem").run();
//         }}
//       >
//         <FormatIndentIncreaseRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>

//       <Divider />

//       <LinkButton editor={editor} />
//       <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
//         <FormatQuoteRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
//         <CodeRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       <ToolbarButton title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
//         <HorizontalRuleRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>

//       <Divider />

//       <InsertTableButton editor={editor} />
//       <InsertImageButton editor={editor} />

//       <Divider />

//       <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
//         <FormatClearRoundedIcon sx={{ fontSize: 16 }} />
//       </ToolbarButton>
//       </div>
//       <TableContextToolbar editor={editor} />
//     </>
//   );
// }

// export default CanvasToolbar;













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
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import AudiotrackRoundedIcon from "@mui/icons-material/AudiotrackRounded";

import { classifyFile, uploadCanvasMedia, ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES, ACCEPTED_AUDIO_TYPES } from "./mediaUpload.js";

const TEXT_COLORS = ["#ffffff", "#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc", "#94a3b8"];
const HIGHLIGHT_COLORS = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#e9d5ff", "#fecaca"];
const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px"];
const LINE_HEIGHTS = ["1", "1.15", "1.5", "1.7", "2"];

// Only allow http(s) sources for URL-based inserts.
function isSafeImageUrl(value) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

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
      aria-label={title}
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
        aria-label="Text style"
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
              aria-label={`Set color ${c}`}
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
            aria-label="Link URL"
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

/* ── Insert table: hover-grid picker (Docs-style) ────────────── */
function InsertTableButton({ editor }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState({ rows: 0, cols: 0 });
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const MAX_ROWS = 8;
  const MAX_COLS = 10;

  const apply = (rows, cols) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    setOpen(false);
    setHover({ rows: 0, cols: 0 });
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <ToolbarButton title="Insert table" active={open} onClick={() => setOpen((v) => !v)}>
        <TableChartRoundedIcon sx={{ fontSize: 16 }} />
      </ToolbarButton>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30,
            background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,.5)", padding: "10px",
          }}
        >
          <div
            style={{
              fontSize: "11px", color: "rgba(255,255,255,.6)", marginBottom: "8px",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            {hover.rows > 0 ? `${hover.rows} × ${hover.cols}` : "Insert table"}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${MAX_COLS}, 16px)`,
              gridTemplateRows: `repeat(${MAX_ROWS}, 16px)`,
              gap: "3px",
            }}
            onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
          >
            {Array.from({ length: MAX_ROWS * MAX_COLS }).map((_, i) => {
              const r = Math.floor(i / MAX_COLS) + 1;
              const c = (i % MAX_COLS) + 1;
              const filled = r <= hover.rows && c <= hover.cols;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHover({ rows: r, cols: c })}
                  onClick={() => apply(r, c)}
                  style={{
                    width: 16, height: 16, borderRadius: "2px", cursor: "pointer",
                    background: filled ? "rgba(255,255,255,.55)" : "rgba(255,255,255,.08)",
                    border: "1px solid rgba(255,255,255,.15)",
                    transition: "background .05s",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Contextual table toolbar — only shown when cursor is in a table ── */
function TableContextToolbar({ editor }) {
  if (!editor.isActive("table")) return null;

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "3px", flexWrap: "wrap",
        padding: "6px 28px", background: "#181818",
        borderBottom: "1px solid rgba(255,255,255,.05)",
      }}
    >
      <span style={{ fontSize: "10.5px", color: "rgba(255,255,255,.4)", marginRight: "4px", fontFamily: "'Inter',sans-serif" }}>
        Table
      </span>

      <ToolbarButton title="Insert row above" onClick={() => editor.chain().focus().addRowBefore().run()}>Row ↑</ToolbarButton>
      <ToolbarButton title="Insert row below" onClick={() => editor.chain().focus().addRowAfter().run()}>Row ↓</ToolbarButton>
      <ToolbarButton title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>Del row</ToolbarButton>

      <Divider />

      <ToolbarButton title="Insert column left" onClick={() => editor.chain().focus().addColumnBefore().run()}>Col ←</ToolbarButton>
      <ToolbarButton title="Insert column right" onClick={() => editor.chain().focus().addColumnAfter().run()}>Col →</ToolbarButton>
      <ToolbarButton title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>Del col</ToolbarButton>

      <Divider />

      <ToolbarButton
        title="Toggle header row"
        active={editor.isActive("tableHeader")}
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      >
        Header
      </ToolbarButton>
      <ToolbarButton title="Merge cells" onClick={() => editor.chain().focus().mergeCells().run()}>Merge</ToolbarButton>
      <ToolbarButton title="Split cell" onClick={() => editor.chain().focus().splitCell().run()}>Split</ToolbarButton>

      <Divider />

      <ToolbarButton
        title="Delete table"
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        <span style={{ color: "#f87171" }}>Delete table</span>
      </ToolbarButton>
    </div>
  );
}

/* ── Generic media insert: drag-drop / file-picker upload, ────
   optional URL fallback ──────────────────────────────────────── */
function MediaInsertButton({ canvasId, authHeaders, kind, icon, title, accept, isSafeUrl, onInsert, allowUrl = false }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [error, setError] = useState("");
  const ref = useRef(null);
  const fileInputRef = useRef(null);
  useClickOutside(ref, () => { setOpen(false); setError(""); });

  const doUpload = async (file) => {
    if (classifyFile(file) !== kind) {
      setError(`Please choose a ${kind} file.`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const media = await uploadCanvasMedia(canvasId, authHeaders, file);
      onInsert(media.url);
      setOpen(false);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const insertUrl = () => {
    const url = urlValue.trim();
    if (!url) return;
    if (!isSafeUrl(url)) {
      setError(`Only http:// or https:// ${kind} URLs are allowed.`);
      return;
    }
    onInsert(url);
    setOpen(false);
    setUrlValue("");
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <ToolbarButton title={title} active={open} onClick={() => setOpen((v) => !v)}>
        {icon}
      </ToolbarButton>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30,
          background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,.5)", padding: "8px", width: "230px",
          display: "flex", flexDirection: "column", gap: "8px",
        }}>
          {allowUrl && (
            <div style={{ display: "flex", gap: "4px" }}>
              {["upload", "url"].map((m) => (
                <button key={m} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setMode(m)}
                  style={{
                    flex: 1, fontSize: "10.5px", padding: "5px 0", borderRadius: "5px", cursor: "pointer",
                    background: mode === m ? "rgba(255,255,255,.12)" : "none",
                    border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)",
                  }}
                >
                  {m === "upload" ? "Upload" : "URL"}
                </button>
              ))}
            </div>
          )}

          {mode === "upload" ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) doUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `1.5px dashed ${dragOver ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.18)"}`,
                borderRadius: "6px", padding: "18px 10px", textAlign: "center",
                cursor: "pointer", color: "rgba(255,255,255,.5)", fontSize: "11px",
              }}
            >
              {uploading ? "Uploading…" : `Drop ${kind === "image" ? "an" : "a"} ${kind} or click to choose`}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) doUpload(f); }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                autoFocus
                value={urlValue}
                onChange={(e) => { setUrlValue(e.target.value); if (error) setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") insertUrl(); if (e.key === "Escape") setOpen(false); }}
                placeholder={`https://…${kind}`}
                style={{ flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: "5px", color: "rgba(255,255,255,.85)", fontSize: "11px", padding: "5px 7px", outline: "none" }}
              />
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={insertUrl}
                style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: "5px", color: "rgba(255,255,255,.9)", fontSize: "11px", padding: "0 10px", cursor: "pointer" }}>
                Set
              </button>
            </div>
          )}

          {error && <div style={{ fontSize: "10px", color: "#f87171" }}>{error}</div>}
        </div>
      )}
    </div>
  );
}

/* ── Font size / line spacing dropdown ───────────────────────── */
function SimpleDropdown({ label, options, activeCheck, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        style={{
          background: open ? "rgba(255,255,255,.08)" : "none",
          border: "1px solid rgba(255,255,255,.1)", borderRadius: "6px",
          color: "rgba(255,255,255,.75)", fontSize: "11px", fontFamily: "'Inter',sans-serif",
          padding: "5px 8px", cursor: "pointer",
        }}
      >
        {label} ▾
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 30,
          background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,.5)", padding: "4px", minWidth: "70px",
        }}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onSelect(opt); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                background: activeCheck(opt) ? "rgba(255,255,255,.08)" : "none", border: "none",
                borderRadius: "5px", color: "rgba(255,255,255,.85)", fontSize: "11.5px",
                fontFamily: "'Inter',sans-serif", padding: "6px 8px", cursor: "pointer",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Find & Replace ───────────────────────────────────────────── */
function FindReplacePanel({ editor, onClose }) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [matches, setMatches] = useState([]);
  const [current, setCurrent] = useState(-1);

  const runSearch = (q) => {
    if (!q) { setMatches([]); setCurrent(-1); return; }
    const found = [];
    editor.state.doc.descendants((node, pos) => {
      if (!node.isText) return;
      const text = node.text || "";
      let idx = 0;
      const lower = text.toLowerCase();
      const needle = q.toLowerCase();
      while (idx !== -1) {
        idx = lower.indexOf(needle, idx);
        if (idx !== -1) {
          found.push({ from: pos + idx, to: pos + idx + q.length });
          idx += q.length;
        }
      }
    });
    setMatches(found);
    setCurrent(found.length ? 0 : -1);
    if (found.length) selectMatch(found[0]);
  };

  const selectMatch = (m) => {
    editor.chain().setTextSelection({ from: m.from, to: m.to }).run();
    const coords = editor.view.coordsAtPos(m.from);
    document.elementFromPoint(coords.left, coords.top)?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const goTo = (dir) => {
    if (!matches.length) return;
    const next = (current + dir + matches.length) % matches.length;
    setCurrent(next);
    selectMatch(matches[next]);
  };

  const replaceOne = () => {
    if (current === -1 || !matches[current]) return;
    const m = matches[current];
    editor.chain().insertContentAt({ from: m.from, to: m.to }, replacement).run();
    runSearch(query);
  };

  const replaceAll = () => {
    if (!matches.length) return;
    let offset = 0;
    matches.forEach((m) => {
      const from = m.from + offset;
      const to = m.to + offset;
      editor.chain().insertContentAt({ from, to }, replacement).run();
      offset += replacement.length - (m.to - m.from);
    });
    setQuery("");
    setMatches([]);
    setCurrent(-1);
  };

  return (
    <div style={{
      position: "absolute", top: 8, right: 8, zIndex: 40,
      background: "#151515", border: "1px solid rgba(255,255,255,.15)", borderRadius: "8px",
      boxShadow: "0 8px 24px rgba(0,0,0,.5)", padding: "8px", display: "flex", flexDirection: "column", gap: "6px", width: "230px",
    }}>
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); runSearch(e.target.value); }}
          onKeyDown={(e) => { if (e.key === "Enter") goTo(1); if (e.key === "Escape") onClose(); }}
          placeholder="Find"
          style={{ flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "5px", color: "#fff", fontSize: "11px", padding: "5px 7px", outline: "none" }}
        />
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,.4)", alignSelf: "center" }}>
          {matches.length ? `${current + 1}/${matches.length}` : "0/0"}
        </span>
        <button onClick={() => goTo(-1)} style={{ background: "none", border: "1px solid rgba(255,255,255,.1)", borderRadius: "5px", color: "#fff", cursor: "pointer" }}>↑</button>
        <button onClick={() => goTo(1)} style={{ background: "none", border: "1px solid rgba(255,255,255,.1)", borderRadius: "5px", color: "#fff", cursor: "pointer" }}>↓</button>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer" }}>×</button>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
          placeholder="Replace with"
          style={{ flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "5px", color: "#fff", fontSize: "11px", padding: "5px 7px", outline: "none" }}
        />
        <button onClick={replaceOne} style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", borderRadius: "5px", color: "#fff", fontSize: "10px", padding: "0 8px", cursor: "pointer" }}>Replace</button>
        <button onClick={replaceAll} style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", borderRadius: "5px", color: "#fff", fontSize: "10px", padding: "0 6px", cursor: "pointer" }}>All</button>
      </div>
    </div>
  );
}

/* ── Main toolbar ─────────────────────────────────────────────── */
function CanvasToolbar({ editor, canvasId, authHeaders }) {
  const [findOpen, setFindOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFindOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!editor) return null;

  const canIndent = editor.isActive("listItem") || editor.isActive("taskItem");

  return (
    <div style={{ position: "relative" }}>
      <div className="canvas-format-toolbar" style={{ display: "flex", alignItems: "center", gap: "3px", flexWrap: "wrap" }}>
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <UndoRoundedIcon sx={{ fontSize: 16 }} />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <RedoRoundedIcon sx={{ fontSize: 16 }} />
        </ToolbarButton>

        <Divider />

        <HeadingDropdown editor={editor} />

        <SimpleDropdown
          label={editor.getAttributes("fontSize").size || "Size"}
          options={FONT_SIZES}
          activeCheck={(o) => editor.getAttributes("fontSize").size === o}
          onSelect={(o) => editor.chain().focus().setFontSize(o).run()}
        />
        <SimpleDropdown
          label="Spacing"
          options={LINE_HEIGHTS}
          activeCheck={(o) => editor.getAttributes("paragraph").lineHeight === o}
          onSelect={(o) => editor.chain().focus().setLineHeight(o).run()}
        />

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

        <InsertTableButton editor={editor} />

        <MediaInsertButton
          canvasId={canvasId}
          authHeaders={authHeaders}
          kind="image"
          icon={<ImageRoundedIcon sx={{ fontSize: 16 }} />}
          title="Insert image"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          isSafeUrl={isSafeImageUrl}
          allowUrl
          onInsert={(url) => editor.chain().focus().setImage({ src: url }).run()}
        />

        <MediaInsertButton
          canvasId={canvasId}
          authHeaders={authHeaders}
          kind="video"
          icon={<VideocamRoundedIcon sx={{ fontSize: 16 }} />}
          title="Insert video"
          accept={ACCEPTED_VIDEO_TYPES.join(",")}
          isSafeUrl={isSafeImageUrl}
          allowUrl
          onInsert={(url) => editor.chain().focus().insertContent({ type: "videoEmbed", attrs: { src: url } }).run()}
        />

        <MediaInsertButton
          canvasId={canvasId}
          authHeaders={authHeaders}
          kind="audio"
          icon={<AudiotrackRoundedIcon sx={{ fontSize: 16 }} />}
          title="Insert audio"
          accept={ACCEPTED_AUDIO_TYPES.join(",")}
          isSafeUrl={isSafeImageUrl}
          onInsert={(url) => editor.chain().focus().insertContent({ type: "audioEmbed", attrs: { src: url } }).run()}
        />

        <Divider />

        <ToolbarButton title="Find and replace (⌘F)" onClick={() => setFindOpen((v) => !v)}>
          🔍
        </ToolbarButton>

        <ToolbarButton title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <FormatClearRoundedIcon sx={{ fontSize: 16 }} />
        </ToolbarButton>
      </div>

      <TableContextToolbar editor={editor} />

      {findOpen && <FindReplacePanel editor={editor} onClose={() => setFindOpen(false)} />}
    </div>
  );
}

export default CanvasToolbar;