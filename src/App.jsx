import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Home as HomeIcon, CalendarDays, Ticket, PackageCheck, Bell } from "lucide-react";

import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Queue from "./pages/Queue";
import Track from "./pages/Track";
import Updates from "./pages/Updates";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/track" element={<Track />} />
        <Route path="/updates" element={<Updates />} />

      </Routes>

      <nav className="bottom-nav">

        <NavLink to="/">
          <HomeIcon size={18} />
          Home
        </NavLink>

        <NavLink to="/schedule">
          <CalendarDays size={18} />
          Schedule
        </NavLink>

        <NavLink to="/queue">
          <Ticket size={18} />
          Queue
        </NavLink>

        <NavLink to="/track">
          <PackageCheck size={18} />
          Track
        </NavLink>

        <NavLink to="/updates">
          <Bell size={18} />
          Updates
        </NavLink>

      </nav>
    </BrowserRouter>
  );
}

export default App;