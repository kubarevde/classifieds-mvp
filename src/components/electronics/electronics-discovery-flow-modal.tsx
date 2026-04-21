"use client";

import { useMemo, useState } from "react";

import { DiscoveryStepCard } from "@/components/agriculture/discovery-step-card";
import {
  ElectronicsDiscoveryAnswers,
  ElectronicsDiscoveryBudget,
  ElectronicsDiscoveryCondition,
  ElectronicsDiscoveryUseCase,
} from "@/lib/discovery";

type ElectronicsDiscoveryFlowModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (answers: ElectronicsDiscoveryAnswers) => void;
};

type StepConfig = {
  key: keyof ElectronicsDiscoveryAnswers;
  title: string;
  subtitle: string;
  options: { id: string; label: string }[];
};

const steps: StepConfig[] = [
  {
    key: "budget",
    title: "Шаг 1 из 3",
    subtitle: "Какой бюджет закладываем?",
    options: [
      { id: "budget", label: "До 60 000 ₽" },
      { id: "mid", label: "60 000 - 130 000 ₽" },
      { id: "premium", label: "Верхний сегмент" },
    ],
  },
  {
    key: "useCase",
    title: "Шаг 2 из 3",
    subtitle: "Основной сценарий использования",
    options: [
      { id: "work", label: "Работа и учёба" },
      { id: "gaming", label: "Игры" },
      { id: "content", label: "Контент и креатив" },
      { id: "study", label: "Учёба" },
      { id: "cheap", label: "Просто недорогой вариант" },
    ],
  },
  {
    key: "condition",
    title: "Шаг 3 из 3",
    subtitle: "Какое состояние приоритетнее?",
    options: [
      { id: "new", label: "Новый / как новый" },
      { id: "used", label: "Б/у" },
      { id: "any", label: "Не важно" },
    ],
  },
];

const initialAnswers: Partial<ElectronicsDiscoveryAnswers> = {};

export function ElectronicsDiscoveryFlowModal({
  isOpen,
  onClose,
  onComplete,
}: ElectronicsDiscoveryFlowModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<ElectronicsDiscoveryAnswers>>(initialAnswers);

  const step = steps[currentStep];
  const progressLabel = `${currentStep + 1} / ${steps.length}`;
  const canContinue = Boolean(answers[step.key]);
  const stepSelection = useMemo(
    () => (answers[step.key] ? String(answers[step.key]) : undefined),
    [answers, step.key],
  );

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    setCurrentStep(0);
    setAnswers(initialAnswers);
    onClose();
  }

  function handleSelect(optionId: string) {
    if (step.key === "budget") {
      setAnswers((prev) => ({ ...prev, budget: optionId as ElectronicsDiscoveryBudget }));
      return;
    }

    if (step.key === "useCase") {
      setAnswers((prev) => ({ ...prev, useCase: optionId as ElectronicsDiscoveryUseCase }));
      return;
    }

    setAnswers((prev) => ({ ...prev, condition: optionId as ElectronicsDiscoveryCondition }));
  }

  function handleNext() {
    if (!canContinue) {
      return;
    }

    if (currentStep === steps.length - 1) {
      onComplete(answers as ElectronicsDiscoveryAnswers);
      handleClose();
      return;
    }

    setCurrentStep((prev) => prev + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-3 sm:items-center sm:justify-center sm:p-6">
      <button type="button" onClick={handleClose} className="absolute inset-0" aria-label="Закрыть модальное окно" />
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-300 bg-slate-50 p-4 shadow-xl shadow-slate-950/20 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Discovery mode</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Техно-навигатор покупки</h3>
          </div>
          <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
            {progressLabel}
          </span>
        </div>

        <DiscoveryStepCard
          title={step.title}
          subtitle={step.subtitle}
          options={step.options}
          selected={stepSelection}
          onSelect={handleSelect}
        />

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={currentStep === 0 ? handleClose : () => setCurrentStep((prev) => prev - 1)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {currentStep === 0 ? "Отмена" : "Назад"}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canContinue}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {currentStep === steps.length - 1 ? "Открыть подборку" : "Дальше"}
          </button>
        </div>
      </div>
    </div>
  );
}
