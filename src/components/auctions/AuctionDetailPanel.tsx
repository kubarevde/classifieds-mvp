"use client";

import { FormEvent, useMemo, useState } from "react";

import type { AuctionState } from "@/entities/auction/model";
import { mockAuctionService } from "@/services/auctions";
import { getBidIncrement, getMinimumNextBid } from "@/services/auctions/rules";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { captureException } from "@/lib/monitoring";

import { AuctionStatusBadge } from "./AuctionStatusBadge";
import { CountdownTimer } from "./CountdownTimer";
import { useAuctionBidderEligibility } from "./use-auction-bidder-eligibility";

type AuctionDetailPanelProps = {
  auction: AuctionState;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

function formatBidTime(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function AuctionDetailPanel({ auction }: AuctionDetailPanelProps) {
  const [state, setState] = useState(auction);
  const autoBidGate = useFeatureGate("auction_auto_bid");
  const { bidder, controls } = useAuctionBidderEligibility();
  const [amount, setAmount] = useState(() => String(getMinimumNextBid(state)));
  const [isAutoBidEnabled, setIsAutoBidEnabled] = useState(false);
  const [autoBidMax, setAutoBidMax] = useState(() => String(getMinimumNextBid(state) + 10_000));
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const reserveReached = state.reservePrice == null || state.currentBid >= state.reservePrice;
  const nextMinBid = useMemo(() => getMinimumNextBid(state), [state]);
  const increment = useMemo(() => getBidIncrement(state.currentBid, state.minBidIncrement), [state.currentBid, state.minBidIncrement]);
  const canBid =
    (state.status === "live" || state.status === "ending_soon") &&
    (bidder.bidderEligibility === "verified" || bidder.bidderEligibility === "eligible_premium") &&
    bidder.paymentReadiness === "confirmed" &&
    bidder.auctionTermsAccepted;

  function applyQuickIncrement(multiplier: number) {
    const value = nextMinBid + increment * (multiplier - 1);
    setAmount(String(value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const parsedAmount = Number.parseInt(amount, 10);
    const parsedAutoBidMax = Number.parseInt(autoBidMax, 10);

    if (!Number.isFinite(parsedAmount) || parsedAmount < nextMinBid) {
      setError(`Минимальная ставка: ${formatMoney(nextMinBid)} ₽`);
      return;
    }
    if ((parsedAmount - nextMinBid) % increment !== 0) {
      setError(`Следующий шаг для этого аукциона — ${formatMoney(increment)} ₽`);
      return;
    }
    if (isAutoBidEnabled && (!Number.isFinite(parsedAutoBidMax) || parsedAutoBidMax < parsedAmount)) {
      setError("Максимальная auto-bid сумма должна быть выше или равна ставке.");
      return;
    }

    setIsPending(true);
    try {
      const result = await mockAuctionService.placeBid({
        auctionId: state.id,
        bidder,
        amount: parsedAmount,
        autoBidMax: isAutoBidEnabled && bidder.autoBidAllowed ? parsedAutoBidMax : undefined,
      });
      setState(result.auction);
      setAmount(String(getMinimumNextBid(result.auction)));
      setAutoBidMax(String(getMinimumNextBid(result.auction) + 10_000));
    } catch (submitError) {
      captureException(submitError, { area: "auction-place-bid", auctionId: state.id });
      setError(submitError instanceof Error ? submitError.message : "Не удалось разместить ставку.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <aside className="space-y-4 rounded-2xl border border-indigo-100 bg-[linear-gradient(to_bottom,#ffffff,#f5f8ff)] p-4 shadow-sm sm:p-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Аукцион</h2>
          <AuctionStatusBadge status={state.status} />
        </div>
        <p className="text-3xl font-bold text-slate-900">{formatMoney(state.currentBid)} ₽</p>
        <p className="text-sm text-slate-600">
          Старт: {formatMoney(state.startPrice)} ₽ · Ставок: {state.bidCount}
        </p>
        <p className="text-sm text-slate-600">
          Следующая минимальная: {formatMoney(nextMinBid)} ₽ · Шаг: {formatMoney(increment)} ₽
        </p>
        <CountdownTimer endAt={state.endAt} />
        <p className="text-xs text-slate-500">
          Если ставка сделана в последние 2 минуты, аукцион автоматически продлевается на {state.antiSnipingExtension} минут.
        </p>
      </div>

      <div className={`rounded-xl border px-3 py-2 text-sm ${reserveReached ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
        {reserveReached ? "Резерв достигнут" : "Резерв не достигнут"}
      </div>

      <section className="space-y-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">
        <h3 className="font-semibold text-slate-900">Статус допуска</h3>
        <ul className="space-y-1 text-slate-600">
          <li>Профиль: {bidder.bidderEligibility === "guest" ? "гость" : bidder.bidderEligibility === "unverified" ? "не подтверждён" : "подтверждён"}</li>
          <li>Способ оплаты: {bidder.paymentReadiness === "confirmed" ? "подтверждён" : "не подтверждён"}</li>
          <li>Депозит: {bidder.depositRequired ? "может потребоваться" : "не требуется"}</li>
          <li>Условия участия: {bidder.auctionTermsAccepted ? "приняты" : "не приняты"}</li>
        </ul>
        <div className="flex flex-wrap gap-2">
          {bidder.bidderEligibility === "unverified" ? (
            <button
              type="button"
              onClick={() => controls.setManuallyVerified(true)}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700"
            >
              Подтвердить профиль (mock)
            </button>
          ) : null}
          {bidder.bidderEligibility === "funding_required" ? (
            <button
              type="button"
              onClick={() => controls.setFundingApproved(true)}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700"
            >
              Подтвердить оплату (mock)
            </button>
          ) : null}
          <label className="inline-flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={controls.auctionTermsAccepted}
              onChange={(event) => controls.setAuctionTermsAccepted(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Принять условия участия
          </label>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-3">
        {!canBid ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {bidder.bidderEligibility === "guest"
              ? "Войдите, чтобы участвовать в аукционе."
              : bidder.bidderEligibility === "unverified"
                ? "Подтвердите профиль, чтобы делать ставки."
                : bidder.bidderEligibility === "funding_required"
                  ? "Подтвердите способ оплаты, чтобы участвовать."
                  : "Примите условия участия, чтобы продолжить."}
          </div>
        ) : null}
        <label className="space-y-1">
          <span className="text-sm font-medium text-slate-700">Сумма ставки</span>
          <input
            type="number"
            min={nextMinBid}
            step={increment}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {[1, 2, 5].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => applyQuickIncrement(m)}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              +{m} шаг
            </button>
          ))}
        </div>

        {autoBidGate.allowed ? (
          <div className="space-y-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isAutoBidEnabled}
                onChange={(event) => setIsAutoBidEnabled(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Auto-bid (система повышает ставку автоматически)
            </label>
            <p className="text-xs text-indigo-800">
              Система ставит только минимально необходимую сумму и не превышает ваш лимит.
            </p>
            {isAutoBidEnabled ? (
              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Максимум auto-bid</span>
                <input
                  type="number"
                  min={nextMinBid}
                  step={increment}
                  value={autoBidMax}
                  onChange={(event) => setAutoBidMax(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
              </label>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Автоставка</h3>
            <p className="text-sm text-slate-700">
              Система будет автоматически повышать ставку за вас до указанного лимита.
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600">
              <li>не нужно следить за аукционом каждую минуту,</li>
              <li>система ставит только минимально нужную сумму,</li>
              <li>вы не переплачиваете выше своего лимита.</li>
            </ul>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Обновить тариф для Auto-bid
            </button>
          </div>
        )}

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isPending || !canBid}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isPending ? "Отправляем..." : "Сделать ставку"}
        </button>
      </form>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">История ставок</h3>
        <ul className="space-y-2">
          {[...state.bids]
            .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime())
            .map((bid) => (
              <li key={bid.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">{bid.bidderName}</span>
                  <span className="font-semibold text-slate-900">{formatMoney(bid.amount)} ₽</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{formatBidTime(bid.placedAt)}</span>
                  <span>{bid.isAutoBid ? "Auto-bid" : bid.status}</span>
                </div>
              </li>
            ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
        <h3 className="mb-1 font-semibold text-slate-900">Как работает аукцион</h3>
        <p>
          Ставки повышаются по фиксированному шагу в зависимости от текущей цены. Побеждает максимальная ставка;
          при равенстве приоритет у более ранней ставки.
        </p>
      </section>
    </aside>
  );
}
