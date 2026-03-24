import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/authSlice.js";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading, error, initialized } = useSelector((state) => state.auth);

    const logout = async () => {
        await dispatch(logoutUser());
        navigate("/login");
    };

    const isRole = (...roles) => roles.includes(user?.role);

    return { user, loading, error, initialized, logout, isRole };
};

export default useAuth;