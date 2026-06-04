import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate({ to: "/welcome" });
  }, [user, navigate]);

  return (
    <div className="relative min-h-screen pb-24">
      <Outlet />
      <BottomNav />
    </div>
  );
}
