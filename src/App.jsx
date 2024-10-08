// src/App.js
import { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Home from './components/Home/Home';
import Admin from './components/auth/Admin';
import EventsPage from './components/events/EventsPage';
import AddEventButton from './components/admin/AddEventButton';
import EventForm from './components/admin/EventForm';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Route, Routes } from "react-router-dom";

import User from './components/auth/User';
import { AuthProvider } from './components/auth/AuthContext';
import AuthDetails from './components/auth/AuthDetails'; // Import AuthDetails component
import IdeasPage from './components/events/types/IdeasPage';
import IdeaForm from './components/admin/IdeaForm';
import IdeaDetails from './components/events/types/IdeaDetails';
import RSVP from './components/events/types/RSVP';
import WinningIdea from './components/events/types/WinningIdea';
import LogIn from './components/HomePage/LoginPage';
import Analytics from './components/events/types/Analytics';


function App() {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BrowserRouter>
        <CssBaseline />
        <AuthProvider>
          <AuthDetails /> 
          <Routes>
            {/* <Route path="/" element={<EventsPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} /> */}
            <Route path="/" element={<LogIn/>} />
        
            <Route path="/admin" element={<Admin />} />
            <Route path="/user" element={<User />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId/ideas" element={<IdeasPage />} />
            <Route path="/events/:eventId/ideaform" element={<IdeaForm />} />
            <Route path="/events/:eventId/ideas/:ideaId" element={<IdeaDetails />} />
            <Route path="/eventform" element={<EventForm />} />
            <Route path="/events/:eventId/ideas/:ideaId/rsvp" element={<RSVP />} />
            <Route path="/events/:eventId/ideas/winningIdea/:ideaId" element={<WinningIdea />} />
            <Route path="/events/:eventId/ideas/:ideaId/analytics" element={<Analytics />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </LocalizationProvider>
  );
}

export default App;
