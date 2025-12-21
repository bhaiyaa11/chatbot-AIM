// function FileAttach({ setFile }) {
//         const fileInputRef = useRef(null);

//         return (
//           <>
//             <input
//               type="file"
//               ref={fileInputRef}
//               accept=".pdf,.png,.mp4,.jpeg,.jpg,.csv,.docx,.xlsx,.txt,.pptx"
//               hidden
//               onChange={(e) => setFile(e.target.files[0])}
//             />

//             <button
//               type="button"
//               className="attach-btn"
//               onClick={() => fileInputRef.current.click()}
//             >
//               📎
//             </button>
//           </>
//         );
//       }
// export default FileAttach;