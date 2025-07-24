import { useState } from "react";
import { LoginPage } from "@/components/LoginPage";
import { HandGestureInterface } from "@/components/HandGestureInterface";

const Index = () => {
  const [user, setUser] = useState<string | null>(null);

  const handleLogin = (username: string) => {
    setUser(username);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <HandGestureInterface username={user} onLogout={handleLogout} />;
};

export default Index;
