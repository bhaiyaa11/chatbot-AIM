// import './sheader.css';
// import { useAuth } from '../contexts/AuthContext';


// function Sheader() {
//   const { user, signInWithGoogle, logOut } = useAuth();



//   return (
//     <div className='top'>
//       <div className="sheader">
//         <h2>ALLINMOTION</h2>
//       </div>
//       <div className="user_profile">
//         {user ? (
//           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
//             <img
//               src={user.photoURL}
//               alt="user"
//               style={{
//                 width: '35px',
//                 height: '35px',
//                 borderRadius: '50%',
//                 border: '1px solid #000000ff',
//               }}
//             />
//             <span>{user.displayName}</span>
//             <button style={{ backgroundColor: 'black', color: 'white', border: 'none' ,  cursor: 'pointer'}} onClick={logOut}>Sign Out</button>
//           </div>
//         ) : 
//         (
//           <button style={{
//             backgroundColor: 'black',color: 'white',border: 'none',cursor: 'pointer'}} onClick={signInWithGoogle}>Sign In</button>
//         )}
//       </div>
//     </div>
//   );
// }








// export default Sheader;


