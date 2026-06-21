import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { isLoggedIn } from "./services/session";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <LoginPage />}
                />
                <Route
                    path="/register"
                    element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects"
                    element={
                        <ProtectedRoute>
                            <ProjectsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects/:id"
                    element={
                        <ProtectedRoute>
                            <ProjectDetailsPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
