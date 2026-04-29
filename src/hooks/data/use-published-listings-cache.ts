"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { Listing } from "@/lib/types";

const STORAGE_KEY = "classifieds:published-listings";
const MAX_ENTRIES = 24;

type PublishedMap = Record<string, Listing>;

const serverSnapshot: PublishedMap = {};

let cache: PublishedMap | null = null;
const listeners = new Set<() => void>();

function readSnapshot(): PublishedMap {
  if (typeof window === "undefined") {
    return serverSnapshot;
  }
  if (cache) {
    return cache;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as PublishedMap) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function prune(listings: PublishedMap): PublishedMap {
  const entries = Object.entries(listings);
  if (entries.length <= MAX_ENTRIES) {
    return listings;
  }
  return Object.fromEntries(entries.slice(entries.length - MAX_ENTRIES));
}

function write(next: PublishedMap) {
  cache = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPublishedListingFromCache(id: string): Listing | null {
  return readSnapshot()[id] ?? null;
}

export function putPublishedListingInCache(id: string, listing: Listing) {
  const prev = readSnapshot();
  write(prune({ ...prev, [id]: listing }));
}

export function removePublishedListingFromCache(id: string) {
  const prev = readSnapshot();
  const next = { ...prev };
  delete next[id];
  write(next);
}

export function usePublishedListing(id: string | null): Listing | null {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => serverSnapshot);
  if (!id) {
    return null;
  }
  return snapshot[id] ?? null;
}

export function usePutPublishedListing() {
  return useCallback((id: string, listing: Listing) => {
    putPublishedListingInCache(id, listing);
  }, []);
}
