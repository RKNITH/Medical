import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/common/Loader.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, initialized } = useSelector((state) => state.auth);

    if (!initialized) return <Loader />;

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;