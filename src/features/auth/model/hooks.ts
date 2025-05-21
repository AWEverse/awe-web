import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated } from "./selectors";
import { login, logout } from "./authSlice";

export function useAuth() {
  return useSelector(selectIsAuthenticated);
}

export function useLogin() {
  const dispatch = useDispatch();
  return () => dispatch(login());
}

export function useLogout() {
  const dispatch = useDispatch();
  return () => dispatch(logout());
}
