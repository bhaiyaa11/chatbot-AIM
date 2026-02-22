// import { Slate, Editable, withReact } from "slate-react";
// import { createEditor } from "slate";
// import { withHistory } from "slate-history";
// import { useMemo } from "react";

// const DEFAULT_VALUE = [
//   {
//     type: "paragraph",
//     children: [{ text: "" }],
//   },
// ];

// function ScriptCanvas({ content }) {
//   const editor = useMemo(() => withHistory(withReact(createEditor())), []);

//   // 🔒 GUARANTEE a valid Slate value on every render
//   const value = useMemo(() => {
//     if (typeof content !== "string") {
//       return DEFAULT_VALUE;
//     }

//     return [
//       {
//         type: "paragraph",
//         children: [{ text: content }],
//       },
//     ];
//   }, [content]);

//   return (
//     <div className="canvas">
//       <Slate editor={editor} value={value} onChange={() => {}}>
//         <Editable placeholder="Edit your script here..." />
//       </Slate>
//     </div>
//   );
// }

// export default ScriptCanvas;
// import React, { useState, useMemo } from 'react';
// import { createEditor } from 'slate';
// import { Slate, Editable, withReact } from 'slate-react';

// const MyEditor = ({ initialContent }) => {
//   // Ensure initialContent is always an array of elements.
//   // If initialContent might be null or undefined, provide a default.
//   const editor = useMemo(() => withReact(createEditor()), []);
//   const [value, setValue] = useState(
//     initialContent || [ // Provide a default empty paragraph if initialContent is undefined
//       {
//         type: 'paragraph',
//         children: [{ text: '' }],
//       },
//     ]
//   );

//   return (
//     <Slate editor={editor} value={value} onChange={newValue => setValue(newValue)}>
//       <Editable />
//     </Slate>
//   );
// };

// // Example usage where initialContent could be undefined
// const App = () => {
//   // Imagine `data` is fetched asynchronously and might be undefined initially
//   const [data, setData] = useState(undefined); // Or null

//   // In a real app, you might fetch data here
//   // useEffect(() => {
//   //   fetch('/api/content').then(res => res.json()).then(setData);
//   // }, []);

//   return (
//     <div>
//       {/* Render MyEditor, passing the fetched data, or a default empty array if data is not ready */}
//       <MyEditor initialContent={data} />
//     </div>
//   );
// };

// export default MyEditor;




import { useState } from "react";
import FloatingEditMenu from "./floatingEdit";

const ScriptCanvas = () => {
  const [menuPosition, setMenuPosition] = useState(null);
  const [selectedText, setSelectedText] = useState("");

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection.toString();

    if (!text) {
      setMenuPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectedText(text);

    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  return (
    <div
      className="script-canvas"
      contentEditable
      onMouseUp={handleMouseUp}
      style={{
        minHeight: "200px",
        border: "1px solid #333",
        padding: "12px",
      }}
    >
      Select some text here to open AI edit menu.

      <FloatingEditMenu
        position={menuPosition}
        onAction={(action) => console.log(action, selectedText)}
        onAskAI={(q) => console.log(q, selectedText)}
      />
    </div>
  );
};

export default ScriptCanvas;
