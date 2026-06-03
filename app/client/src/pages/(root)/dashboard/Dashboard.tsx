import { Navigate } from "react-router-dom";

import { useUser } from "@/context/UserContext";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import Loading from "@/components/loader";

export default function Dashboard() {
  const { pending, user } = useUser();

  if (pending) {
    return (
      <Loading/>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardView />;
}
