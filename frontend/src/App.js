// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';

// // 페이지 컴포넌트 import
// import Dashboard from './pages/Dashboard';
// import Login from './pages/Login';
// import Register from './pages/Register';
// // import StockDetail from './pages/StockDetail';
// // import Portfolio from './pages/Portfolio';
// import NotFound from './pages/NotFound';

// // 레이아웃 컴포넌트
// import Layout from './components/common/Layout';
// import ProtectedRoute from './components/common/ProtectedRoute';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
          
//           <Route element={<Layout />}>
//             <Route path="/" element={<Navigate to="/dashboard" />} />
//             <Route 
//               path="/dashboard" 
//               element={
//                 <ProtectedRoute>
//                   <Dashboard />
//                 </ProtectedRoute>
//               } 
//             />
//             <Route 
//               path="/stocks/:symbol" 
//               element={
//                 <ProtectedRoute>
//                   {/* <StockDetail /> */}
//                 </ProtectedRoute>
//               } 
//             />
//             <Route 
//               path="/portfolio" 
//               element={
//                 <ProtectedRoute>
//                   {/* <Portfolio /> */}
//                 </ProtectedRoute>
//               } 
//             />
//           </Route>
          
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;