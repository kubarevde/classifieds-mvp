"use client";

import { useMemo, useState } from "react";

import { DiscoveryStepCard } from "@/components/agriculture/discovery-step-card";
import {
  DiscoveryAnswers,
  DiscoveryGeoPreference,
  DiscoveryIntentPreference,
  DiscoveryPricePreference,
} from "@/lib/discovery";

type DiscoveryFlowModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (answers: DiscoveryAnswers) => void;
};

type StepConfig = {
  key: keyof DiscoveryAnswers;
  title: string;
  subtitle: string;
  options: { id: string; label: string }[];
};

const steps: StepConfig[] = [
  {
    key: "price",
    title: "Шаг 1 из 3",
    subtitle: "Какой бюджетный контур нужен?",
    options: [
      { id: "cheap", label: "Оптимально по бюджету" },
      { id: "expensive", label: "Ставка на производительность" },
    ],
  },
  {
    key: "geo",
    title: "Шаг 2 из 3",
    subtitle: "Нужен локальный рынок или широкий охват?",
    options: [
      { id: "my_city", label: "Рядом с моим хозяйством" },
      { id: "all_russia", label: "По всей России" },
    ],
  },
  {
    key: "intent",
    title: "Шаг 3 из 3",
    subtitle: "Что нужно закрыть в первую очередь?",
    options: [
      { id: "machinery", label: "Техника и механизация" },
      { id: "materials", label: "Материалы и расходники" },
      { id: "service", label: "Сервис и поддержка" },
      { id: "farming", label: "Растениеводство и земля" },
      { id: "any", label: "Смешанный режим" },
    ],
  },
];

const initialAnswers: Partial<DiscoveryAnswers> = {};

export function DiscoveryFlowModal({ isOpen, onClose, onComplete }: DiscoveryFlowModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<DiscoveryAnswers>>(initialAnswers);

  const step = steps[currentStep];
  const progressLabel = `${currentStep + 1} / ${steps.length}`;
  const canContinue = Boolean(answers[step.key]);

  const stepSelection = useMemo(() => {
    return answers[step.key] ? String(answers[step.key]) : undefined;
  }, [answers, step.key]);

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    setCurrentStep(0);
    setAnswers(initialAnswers);
    onClose();
  }

  function handleSelect(optionId: string) {
    if (step.key === "price") {
      setAnswers((prev) => ({ ...prev, price: optionId as DiscoveryPricePreference }));
      return;
    }

    if (step.key === "geo") {
      setAnswers((prev) => ({ ...prev, geo: optionId as DiscoveryGeoPreference }));
      return;
    }

    setAnswers((prev) => ({ ...prev, intent: optionId as DiscoveryIntentPreference }));
  }

  function handleNext() {
    if (!canContinue) {
      return;
    }

    if (currentStep === steps.length - 1) {
      onComplete(answers as DiscoveryAnswers);
      handleClose();
      return;
    }

    setCurrentStep((prev) => prev + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-3 sm:items-center sm:justify-center sm:p-6">
      <button type="button" onClick={handleClose} className="absolute inset-0" aria-label="Закрыть модальное окно" />
      <div className="relative w-full max-w-lg rounded-3xl border border-emerald-200 bg-[#f8fbf7] p-4 shadow-xl shadow-emerald-950/20 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Discovery mode</p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-emerald-950">Агро-навигатор задач</h3>
          </div>
          <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-800">
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
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            {currentStep === 0 ? "Отмена" : "Назад"}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canContinue}
            className="rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {currentStep === steps.length - 1 ? "Открыть подборку" : "Дальше"}
          </button>
        </div>
      </div>
    </div>
  );
}
