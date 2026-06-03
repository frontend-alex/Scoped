import AuthLayout from "./components/layouts/AuthLayout";

import { Routes, Route } from "react-router-dom";

import { Landing, Login, Register } from "./pages/(auth)";
import { Dashboard, History, Settings } from "./pages/(root)";

import { AppShell } from "./components/layouts/AppShell";



export function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route element={<AuthLayout />}>
        <Route element={<AppShell />}>
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
