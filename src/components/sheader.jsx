import './sheader.css';
import { useAuth } from '../contexts/AuthContext';


function Sheader() {
  const { user, signInWithGoogle, logOut } = useAuth();



  return (
    <div className='top'>
      <div className="sheader">
        <h2>ALLINMOTION</h2>
      </div>
      <div className="user_profile">
        {user ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={user.photoURL}
              alt="user"
              style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                border: '1px solid #000000ff',
              }}
            />
            <span>{user.displayName}</span>
            <button style={{ backgroundColor: 'black', color: 'white', border: 'none' ,  cursor: 'pointer'}} onClick={logOut}>Sign Out</button>
          </div>
        ) : 
        (
          <button style={{
            backgroundColor: 'black',color: 'white',border: 'none',cursor: 'pointer'}} onClick={signInWithGoogle}>Sign In</button>
        )}
      </div>
    </div>
  );
}







// function Sheader() {
//     const { user, signInWithGoogle, logOut } = useAuth();

//     const handleReload = () => {
//       window.location.reload();
//   };
//   return (
//     <div className="top">
//       <div className="top_title"> 
//         <h2>ALLINMOTION</h2>
//       </div>
//       <div className='user_profile'>
//               <button onClick={handleReload} style={{ marginRight: '10px' }}>
//           🔄 Reload
//         </button>

//         {user ? (
//           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
//             <img
//               src={user.photoURL}
//               alt="user"
//               style={{
//                 width: '35px',
//                 height: '35px',
//                 borderRadius: '50%',
//                 border: '1px solid #ccc',
//               }}
//             />
//             <span>{user.displayName}</span>
//             <button onClick={logOut}>Sign Out</button>
//           </div>
//         ) : (
//           <button onClick={signInWithGoogle}>Sign In with Google</button>
//         )}
//       </div>
      
//     </div>
//   );
// }

export default Sheader;



// function Sheader() {
//   const { user, signInWithGoogle, logOut } = useAuth();

//   const handleReload = () => {
//     window.location.reload();
//   };

//   return (
//     <div className='top'>
//       <div className="sheader">
//         <h2>ALLINMOTION</h2>
//       </div>
//       <div className="user">
//         <button onClick={handleReload} style={{ marginRight: '10px' }}>
//           🔄 Reload
//         </button>

//         {user ? (
//           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
//             <img
//               src={user.photoURL}
//               alt="user"
//               style={{
//                 width: '35px',
//                 height: '35px',
//                 borderRadius: '50%',
//                 border: '1px solid #ccc',
//               }}
//             />
//             <span>{user.displayName}</span>
//             <button onClick={logOut}>Sign Out</button>
//           </div>
//         ) : (
//           <button onClick={signInWithGoogle}>Sign In with Google</button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Sheader;