import { Buffer } from 'buffer';
(window as any). Buffer = Buffer; // Polyfill Buffer toàn cục
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
