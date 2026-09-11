import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  CalendarDays,
  Ticket,
  PackageCheck,
  Bell,
  History as HistoryIcon
} from "lucide-react";

import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Queue from "./pages/Queue";
import Track from "./pages/Track";
import Updates from "./pages/Updates";
import History from "./pages/History";
import BackgroundVideo from "./components/BackgroundVideo";

import "./App.css";

function AppShell() {
  const location = useLocation();
  const isWelcome = location.pathname === "/";

  return (
    <div className="app-layout">
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/track" element={<Track />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/history" element={<History />} />
      </Routes>

      {!isWelcome && (
        <nav className="bottom-nav">
          <NavLink to="/home" end>
            <HomeIcon size={18} />
            <span>Home</span>
          </NavLink>

          <NavLink to="/schedule">
            <CalendarDays size={18} />
            <span>Schedule</span>
          </NavLink>

          <NavLink to="/queue">
            <Ticket size={18} />
            <span>Queue</span>
          </NavLink>

          <NavLink to="/track">
            <PackageCheck size={18} />
            <span>Track</span>
          </NavLink>

          <NavLink to="/updates">
            <Bell size={18} />
            <span>Updates</span>
          </NavLink>

          <NavLink to="/history">
            <HistoryIcon size={18} />
            <span>History</span>
          </NavLink>
        </nav>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Live video wallpaper — rendered once here so it stays fixed
          behind every page/route in the app (Welcome included). */}
      <BackgroundVideo />
      <AppShell />
    </BrowserRouter>
  );
}

export default App;