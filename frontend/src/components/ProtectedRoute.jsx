import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../services/session";

function ProtectedRoute({ children }) {
    return isLoggedIn() ? children : <Navigate to="/" replace />;
}

export default ProtectedRoute;
