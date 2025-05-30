import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title and meta
document.title = "TrotroPay - Digital Trotro Payments";
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "Digital payment solution for Ghana's trotro transport system. Pay fares easily with Mobile Money.";
document.head.appendChild(metaDescription);

const metaViewport = document.querySelector('meta[name="viewport"]');
if (metaViewport) {
  metaViewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no");
}

createRoot(document.getElementById("root")!).render(<App />);
