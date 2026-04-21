"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { ProfileActions } from "@/components/profile/profile-actions";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileHeader } from "@/components/profile/profile-header";
import { useProfile } from "@/components/profile/profile-provider";
import { ProfileStats } from "@/components/profile/profile-stats";
import { NotificationSettingsCard } from "@/components/profile/notification-settings-card";
import type { ProfilePersistedFields } from "@/components/profile/types";

function pickPersisted(profile: ReturnType<typeof useProfile>): ProfilePersistedFields {
  return {
    name: profile.name,
    city: profile.city,
    phone: profile.phone,
    description: profile.description,
    notifyNewMessages: profile.notifyNewMessages,
    notifySavedSearches: profile.notifySavedSearches,
    notifyMyListings: profile.notifyMyListings,
  };
}

function isSameProfile(a: ProfilePersistedFields, b: ProfilePersistedFields) {
  return (
    a.name === b.name &&
    a.city === b.city &&
    a.phone === b.phone &&
    a.description === b.description &&
    a.notifyNewMessages === b.notifyNewMessages &&
    a.notifySavedSearches === b.notifySavedSearches &&
    a.notifyMyListings === b.notifyMyListings
  );
}

type ProfileEditorBodyProps = {
  profile: ReturnType<typeof useProfile>;
  onSaved: () => void;
};

function ProfileEditorBody({ profile, onSaved }: ProfileEditorBodyProps) {
  const [draft, setDraft] = useState(() => pickPersisted(profile));
  const savedSnapshot = pickPersisted(profile);
  const canReset = profile.isHydrated && !isSameProfile(draft, savedSnapshot);

  const patchDraft = (patch: Partial<ProfilePersistedFields>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    profile.saveProfile(draft);
    onSaved();
  };

  const handleReset = () => {
    setDraft(savedSnapshot);
  };

  return (
    <>
      <ProfileForm
        value={{
          name: draft.name,
          city: draft.city,
          phone: draft.phone,
          description: draft.description,
        }}
        onChange={patchDraft}
      />

      <NotificationSettingsCard
        value={{
          notifyNewMessages: draft.notifyNewMessages,
          notifySavedSearches: draft.notifySavedSearches,
          notifyMyListings: draft.notifyMyListings,
        }}
        onChange={patchDraft}
      />

      <ProfileActions onSave={handleSave} onReset={handleReset} canReset={canReset} />
    </>
  );
}

export function ProfilePageClient() {
  const profile = useProfile();
  const [showSaved, setShowSaved] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistedKey = useMemo(() => JSON.stringify(pickPersisted(profile)), [profile]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  const handleSaved = () => {
    setShowSaved(true);
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      setShowSaved(false);
    }, 2600);
  };

  return (
    <div className="relative space-y-4 sm:space-y-5">
      {showSaved ? (
        <div
          className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,360px)] -translate-x-1/2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-lg shadow-emerald-100/60"
          role="status"
          aria-live="polite"
        >
          Изменения сохранены локально
        </div>
      ) : null}

      <ProfileHeader
        name={profile.name}
        city={profile.city}
        email={profile.email}
        phone={profile.phone}
        registeredAtLabel={profile.registeredAtLabel}
        description={profile.description}
      />

      <ProfileStats />

      <ProfileEditorBody key={persistedKey} profile={profile} onSaved={handleSaved} />
    </div>
  );
}
