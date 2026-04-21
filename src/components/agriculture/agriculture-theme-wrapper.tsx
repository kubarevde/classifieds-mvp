import { ReactNode } from "react";

type AgricultureThemeWrapperProps = {
  children: ReactNode;
};

export function AgricultureThemeWrapper({ children }: AgricultureThemeWrapperProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9f2_0%,_#eef6ec_38%,_#f7f4ef_72%,_#f8f5f1_100%)] text-stone-900">
      {children}
    </div>
  );
}
