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
import React, { useState, useMemo } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';

const MyEditor = ({ initialContent }) => {
  // Ensure initialContent is always an array of elements.
  // If initialContent might be null or undefined, provide a default.
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(
    initialContent || [ // Provide a default empty paragraph if initialContent is undefined
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]
  );

  return (
    <Slate editor={editor} value={value} onChange={newValue => setValue(newValue)}>
      <Editable />
    </Slate>
  );
};

// Example usage where initialContent could be undefined
const App = () => {
  // Imagine `data` is fetched asynchronously and might be undefined initially
  const [data, setData] = useState(undefined); // Or null

  // In a real app, you might fetch data here
  // useEffect(() => {
  //   fetch('/api/content').then(res => res.json()).then(setData);
  // }, []);

  return (
    <div>
      {/* Render MyEditor, passing the fetched data, or a default empty array if data is not ready */}
      <MyEditor initialContent={data} />
    </div>
  );
};

export default MyEditor;
