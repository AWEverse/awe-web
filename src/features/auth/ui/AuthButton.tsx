import React from "react";
import { useAuth, useLogin, useLogout } from "../model/hooks";

type AuthButtonProps = {
  component: React.ElementType;
};

export const AuthButton: React.FC<AuthButtonProps> = ({
  component: Component,
}) => {
  const isAuthenticated = useAuth();
  const login = useLogin();
  const logout = useLogout();

  return (
    <Component onClick={isAuthenticated ? logout : login}>
      {isAuthenticated ? "Logout" : "Login"}
    </Component>
  );
};
