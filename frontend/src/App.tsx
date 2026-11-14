import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { TrainSearchPage } from './pages/TrainSearchPage';
import { TrainLiveStatusPage } from './pages/TrainLiveStatusPage';
import { TrainRoutePage } from './pages/TrainRoutePage';
import { StationSearchPage } from './pages/StationSearchPage';
import { StationDetailsPage } from './pages/StationDetailsPage';
import { TrainTimetablePage } from './pages/TrainTimetablePage';
import { TrainComparisonPage } from './pages/TrainComparisonPage';
import { RailwayMapPage } from './pages/RailwayMapPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SystemStatusPage } from './pages/SystemStatusPage';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <div className="flex-1 flex max-w-7xl w-full mx-auto">
              <Sidebar />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
                <Routes>
                  {/* 1. Home dashboard */}
                  <Route path="/" element={<HomePage />} />

                  {/* 2. Train search */}
                  <Route path="/train-search" element={<TrainSearchPage />} />

                  {/* 3. Train live status */}
                  <Route path="/live-status" element={<TrainLiveStatusPage />} />
                  <Route path="/live-status/:trainNumber" element={<TrainLiveStatusPage />} />

                  {/* 4. Train route details */}
                  <Route path="/train-route" element={<TrainRoutePage />} />
                  <Route path="/trains/:trainNumber" element={<TrainRoutePage />} />

                  {/* 5. Station search */}
                  <Route path="/stations" element={<StationSearchPage />} />

                  {/* 6. Station details */}
                  <Route path="/stations/:code" element={<StationDetailsPage />} />

                  {/* 7. Train timetable */}
                  <Route path="/timetable" element={<TrainTimetablePage />} />

                  {/* 8. Train comparison */}
                  <Route path="/comparison" element={<TrainComparisonPage />} />

                  {/* 9. Railway map */}
                  <Route path="/railway-map" element={<RailwayMapPage />} />

                  {/* 10. Login and registration */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* 11. User profile */}
                  <Route path="/profile" element={<UserProfilePage />} />

                  {/* 12. Admin dashboard */}
                  <Route path="/admin" element={<AdminDashboardPage />} />

                  {/* 13. API and system status */}
                  <Route path="/system-status" element={<SystemStatusPage />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
