import React from "react";
import { useAuth, useLogin, useLogout } from "../model/hooks";

type AuthButtonProps = {
  component: React.ElementType;
  login: React.ReactNode;
  logout: React.ReactNode;
};

export const AuthButton: React.FC<AuthButtonProps> = ({
  component: Component,
  login: LabelLogin,
  logout: LabelLogout,
}) => {
  const isAuthenticated = useAuth();
  const login = useLogin();
  const logout = useLogout();

  return (
    <Component onClick={isAuthenticated ? logout : login}>
      {isAuthenticated ? LabelLogout : LabelLogin}
    </Component>
  );
};
