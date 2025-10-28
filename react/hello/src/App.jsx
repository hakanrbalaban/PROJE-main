import { useState } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import ReactDOM from "react-dom/client";
import LeftMenu from "./components/left/leftMenu";
import Login from "./components/auth/login";
import Register from "./components/auth/register";

function App() {
  return (
    <div className="app">
      <div className="left">
        <LeftMenu />
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(<RouterProvider router={router} />);

export default App;
