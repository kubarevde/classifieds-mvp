"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import { defaultProfileFields, profileAccountMock } from "@/lib/profile-mock";

import type { ProfilePersistedFields } from "./types";

const PROFILE_STORAGE_KEY = "classifieds-mvp:profile";
const PROFILE_CHANGE_EVENT = "classifieds-profile-change";

type ProfileStoredPayload = {
  version: 1;
  profile: ProfilePersistedFields;
};

type ProfileContextValue = ProfilePersistedFields & {
  email: string;
  registeredAtIso: string;
  registeredAtLabel: string;
  isHydrated: boolean;
  saveProfile: (next: ProfilePersistedFields) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function formatRegisteredAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitialProfile(): ProfilePersistedFields {
  return { ...defaultProfileFields };
}

const SERVER_PROFILE_SNAPSHOT: ProfilePersistedFields = getInitialProfile();

function parseStoredProfile(raw: string | null): ProfilePersistedFields | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as ProfileStoredPayload;
    if (!parsed || parsed.version !== 1 || !parsed.profile) {
      return null;
    }

    const { profile } = parsed;
    if (
      typeof profile.name !== "string" ||
      typeof profile.city !== "string" ||
      typeof profile.phone !== "string" ||
      typeof profile.description !== "string" ||
      typeof profile.notifyNewMessages !== "boolean" ||
      typeof profile.notifySavedSearches !== "boolean" ||
      typeof profile.notifyMyListings !== "boolean"
    ) {
      return null;
    }

    return {
      name: profile.name,
      city: profile.city,
      phone: profile.phone,
      description: profile.description,
      notifyNewMessages: profile.notifyNewMessages,
      notifySavedSearches: profile.notifySavedSearches,
      notifyMyListings: profile.notifyMyListings,
    };
  } catch {
    return null;
  }
}

let cachedSerialized: string | null = null;
let cachedProfile: ProfilePersistedFields = getInitialProfile();

function invalidateCache() {
  cachedSerialized = null;
}

function readProfileFromStorage(): ProfilePersistedFields {
  if (typeof window === "undefined") {
    return getInitialProfile();
  }

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (raw === cachedSerialized) {
    return cachedProfile;
  }

  const parsed = parseStoredProfile(raw);
  const next = parsed ?? getInitialProfile();
  cachedSerialized = raw;
  cachedProfile = next;
  return cachedProfile;
}

function writeProfileToStorage(next: ProfilePersistedFields) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: ProfileStoredPayload = { version: 1, profile: next };
  const serialized = JSON.stringify(payload);
  window.localStorage.setItem(PROFILE_STORAGE_KEY, serialized);
  cachedSerialized = serialized;
  cachedProfile = next;
  window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
}

function subscribeProfile(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === PROFILE_STORAGE_KEY || event.key === null) {
      invalidateCache();
      onStoreChange();
    }
  };

  const onLocalChange = () => {
    invalidateCache();
    onStoreChange();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(PROFILE_CHANGE_EVENT, onLocalChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PROFILE_CHANGE_EVENT, onLocalChange);
  };
}

function getServerSnapshot(): ProfilePersistedFields {
  return SERVER_PROFILE_SNAPSHOT;
}

function getClientSnapshot(): ProfilePersistedFields {
  return readProfileFromStorage();
}

function subscribeNoop() {
  return () => {};
}

function getClientMountedSnapshot() {
  return true;
}

function getServerMountedSnapshot() {
  return false;
}

type ProfileProviderProps = {
  children: ReactNode;
};

export function ProfileProvider({ children }: ProfileProviderProps) {
  const profile = useSyncExternalStore(subscribeProfile, getClientSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    getClientMountedSnapshot,
    getServerMountedSnapshot,
  );

  const saveProfile = useCallback((next: ProfilePersistedFields) => {
    writeProfileToStorage(next);
  }, []);

  const value = useMemo<ProfileContextValue>(() => {
    const registeredAtIso = profileAccountMock.registeredAt;

    return {
      ...profile,
      email: profileAccountMock.email,
      registeredAtIso,
      registeredAtLabel: formatRegisteredAt(registeredAtIso),
      isHydrated,
      saveProfile,
    };
  }, [isHydrated, profile, saveProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }

  return context;
}
