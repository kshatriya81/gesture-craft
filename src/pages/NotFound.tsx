import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      <div className="text-center relative z-10 animate-fade-in">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <a href="/" className="text-primary hover:text-primary-glow underline-offset-4 hover:underline transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
