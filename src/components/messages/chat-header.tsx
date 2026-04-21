import { Conversation } from "@/lib/messages";
import { Listing } from "@/lib/types";

import { LinkedListingPreview } from "@/components/messages/linked-listing-preview";

type ChatHeaderProps = {
  conversation: Conversation;
  listing: Listing | null;
  onBack?: () => void;
};

export function ChatHeader({ conversation, listing, onBack }: ChatHeaderProps) {
  return (
    <header className="border-b border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">{conversation.participantName}</p>
          <p className="text-sm text-slate-500">{conversation.participantRole}</p>
        </div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            Назад
          </button>
        ) : null}
      </div>

      <div className="mt-3">
        <LinkedListingPreview listing={listing} />
      </div>
    </header>
  );
}
