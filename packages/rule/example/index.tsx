import { createRoot } from "react-dom/client";
import App from "./app";
import React from "react";

const rootDiv = document.getElementById("root");
const root = rootDiv && createRoot(rootDiv);
root && root.render(<App />);
