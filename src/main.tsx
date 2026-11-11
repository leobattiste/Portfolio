import { hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";
const base = import.meta.env.BASE_URL.replace(/\/$/, "");
let path = window.location.pathname;
if (base && path.startsWith(base)) path = path.slice(base.length) || "/";
if (!path.endsWith("/") && !path.includes(".")) path += "/";
hydrateRoot(document.getElementById("root")!, <App path={path} />);
