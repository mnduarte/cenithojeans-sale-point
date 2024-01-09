import { useState, useEffect } from "react";

const Toast = ({ message, type, onClose }: any) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [onClose]);

  const toastStyle: React.CSSProperties = {
    position: "fixed",
    right: isVisible ? "0" : "-100%",
    bottom: "4rem",
    padding: "1rem",
    borderRadius: "0.25rem",
    backgroundColor: type === "success" ? "#015e23" : "#ce1212",
    color: "#fff",
    transition: "right 0.5s ease-in-out",
  };

  return <div style={toastStyle}>{message}</div>;
};

export default Toast;
