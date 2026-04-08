import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddBook from './pages/AddBook';
import SearchBooks from './pages/SearchBooks';
import TradeRequests from './pages/TradeRequests';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import MyBooks from './pages/MyBooks';
import BookDetail from './pages/BookDetail';
import EditBook from './pages/EditBook';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={2000} />
      <main style={{ padding: '2rem 0' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/books/my" element={<PrivateRoute><MyBooks /></PrivateRoute>} />
          <Route path="/books/add" element={<PrivateRoute><AddBook /></PrivateRoute>} />
          <Route path="/books/search" element={<PrivateRoute><SearchBooks /></PrivateRoute>} />
          <Route path="/books/:id" element={<PrivateRoute><BookDetail /></PrivateRoute>} />
          <Route path="/books/edit/:id" element={<PrivateRoute><EditBook /></PrivateRoute>} />
          <Route path="/trades" element={<PrivateRoute><TradeRequests /></PrivateRoute>} />
          <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
          <Route path="/chat/:matchId" element={<PrivateRoute><Chat /></PrivateRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
