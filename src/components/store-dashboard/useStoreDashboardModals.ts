import { useCallback, useEffect, useState } from "react";

import { onboardingSteps } from "@/components/store-dashboard/store-dashboard-shared";

export function useStoreDashboardModals(sellerId: string) {
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    const hasSeenTour = window.sessionStorage.getItem(`store-dashboard-tour-${sellerId}`);
    return !hasSeenTour;
  });
  const [tourStepIndex, setTourStepIndex] = useState(0);

  const activeTourStep = onboardingSteps[tourStepIndex] ?? onboardingSteps[0];

  useEffect(() => {
    if (!isTourOpen) {
      return;
    }
    const target = document.getElementById(activeTourStep.sectionId);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeTourStep.sectionId, isTourOpen]);

  const getSectionClassName = useCallback(
    (baseClassName: string, sectionId: string) => {
      const isActive = isTourOpen && activeTourStep.sectionId === sectionId;
      return `${baseClassName} ${isActive ? "ring-2 ring-sky-300 ring-offset-2" : ""}`;
    },
    [activeTourStep.sectionId, isTourOpen],
  );

  function closeTour() {
    setIsTourOpen(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(`store-dashboard-tour-${sellerId}`, "1");
    }
  }

  function completeTour() {
    closeTour();
    setTourStepIndex(0);
    const target = document.getElementById("dashboard-store-hero");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function launchTour() {
    setTourStepIndex(0);
    setIsTourOpen(true);
  }

  return {
    isTariffModalOpen,
    setIsTariffModalOpen,
    isTourOpen,
    setIsTourOpen,
    tourStepIndex,
    setTourStepIndex,
    activeTourStep,
    closeTour,
    completeTour,
    launchTour,
    getSectionClassName,
  };
}
