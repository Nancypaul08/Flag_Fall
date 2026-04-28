import React from "react";
import { createRoot } from "react-dom/client";
import FlagFallGame from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FlagFallGame />
  </React.StrictMode>
);
