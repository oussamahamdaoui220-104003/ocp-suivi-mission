import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import AddMission from './components/AddMission';
import CompleteMission from './components/CompleteMission';
import AllMissions from "./components/MissionList";
import AllCars from './components/AvailableCars';         // renamed import
import AllDrivers from './components/AvailableDrivers';   // renamed import
import ReportsPage from './components/ReportsPage';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-[#f8f9fb] flex px-10 py-10 gap-10">
        
        {/* Sidebar */}
        <div className="bg-white rounded-2xl shadow-md p-8 w-72">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-gap-3">
            <span>🚗</span>
            <span>Mission Dashboard</span>
          </h1>
          <nav className="space-y-2">
            <Link to="/" className="block p-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
              ➕ Start Mission
            </Link>
            <Link to="/complete" className="block p-3 text-gray-800 rounded-lg hover:bg-gray-100">
              ✔️ Complete Mission
            </Link>
            <Link to="/missions" className="block p-3 text-gray-800 rounded-lg hover:bg-gray-100">
              📍 All Missions
            </Link>
            <Link to="/cars" className="block p-3 text-gray-800 rounded-lg hover:bg-gray-100">
              🚗 All Cars
            </Link>
            <Link to="/drivers" className="block p-3 text-gray-800 rounded-lg hover:bg-gray-100">
              👤 All Drivers
            </Link>
            <Link to="/reports" className="block p-3 text-gray-800 rounded-lg hover:bg-gray-100">
              📊 Reports
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<AddMission />} />
            <Route path="/complete" element={<CompleteMission />} />
            <Route path="/missions" element={<AllMissions />} />
            <Route path="/cars" element={<AllCars />} />
            <Route path="/drivers" element={<AllDrivers />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
};

export default App;
