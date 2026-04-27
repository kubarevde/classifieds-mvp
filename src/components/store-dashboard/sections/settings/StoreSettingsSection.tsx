import { FormEvent } from "react";

import { getSellerTypeLabel } from "@/lib/sellers";
import type { SellerPostType, SellerPost, SellerType } from "@/lib/sellers";

import {
  onboardingSteps,
  type PostFormState,
  type StoreSettingsForm,
} from "@/components/store-dashboard/store-dashboard-shared";
import { StoreDashboardTariffModal } from "@/components/store-dashboard/sections/settings/StoreDashboardTariffModal";
import { StoreDashboardTourModal } from "@/components/store-dashboard/sections/settings/StoreDashboardTourModal";
import { postTypeLabels } from "@/components/store-dashboard/sections/settings/StoreSettingsSection.hooks";
import { formatPostDate } from "@/components/store-dashboard/store-dashboard-shared";

type StoreSettingsSectionProps = {
  getSectionClassName: (baseClassName: string, sectionId: string) => string;
  posts: SellerPost[];
  isPostFormVisible: boolean;
  onTogglePostForm: () => void;
  postForm: PostFormState;
  onPostFormChange: (next: PostFormState | ((prev: PostFormState) => PostFormState)) => void;
  onPostCreate: (event: FormEvent<HTMLFormElement>) => void;
  settings: StoreSettingsForm;
  onSettingsChange: (next: StoreSettingsForm | ((prev: StoreSettingsForm) => StoreSettingsForm)) => void;
  onSettingsSave: (event: FormEvent<HTMLFormElement>) => void;
  onShowMockMessage: (message: string) => void;
  tourModal: {
    isOpen: boolean;
    tourStepIndex: number;
    activeTourStep: (typeof onboardingSteps)[number];
    onClose: () => void;
    onBack: () => void;
    onNextOrComplete: () => void;
  };
  tariffModal: {
    isOpen: boolean;
    onClose: () => void;
  };
};

export function StoreSettingsSection({
  getSectionClassName,
  posts,
  isPostFormVisible,
  onTogglePostForm,
  postForm,
  onPostFormChange,
  onPostCreate,
  settings,
  onSettingsChange,
  onSettingsSave,
  onShowMockMessage,
  tourModal,
  tariffModal,
}: StoreSettingsSectionProps) {
  return (
    <>
      <section className="grid gap-3 lg:grid-cols-2">
        <article
          id="dashboard-store-content"
          className={getSectionClassName(
            "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
            "dashboard-store-content",
          )}
        >
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Контент и аудитория</h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Публикации магазина</p>
                <button
                  type="button"
                  onClick={onTogglePostForm}
                  className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {isPostFormVisible ? "Скрыть форму" : "Новый пост"}
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-600">Лента, сторис и видео форматы расширяются в следующих итерациях.</p>

              {isPostFormVisible ? (
                <form onSubmit={onPostCreate} className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                  <label className="block space-y-1 text-xs">
                    <span className="text-slate-600">Тип публикации</span>
                    <select
                      value={postForm.type}
                      onChange={(event) =>
                        onPostFormChange((prev) => ({ ...prev, type: event.target.value as SellerPostType }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                    >
                      <option value="news">{postTypeLabels.news}</option>
                      <option value="promo">{postTypeLabels.promo}</option>
                      <option value="product">{postTypeLabels.product}</option>
                      <option value="video">{postTypeLabels.video}</option>
                    </select>
                  </label>

                  <label className="block space-y-1 text-xs">
                    <span className="text-slate-600">Заголовок</span>
                    <input
                      value={postForm.title}
                      onChange={(event) => onPostFormChange((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                    />
                  </label>

                  <label className="block space-y-1 text-xs">
                    <span className="text-slate-600">Текст</span>
                    <textarea
                      rows={3}
                      value={postForm.body}
                      onChange={(event) => onPostFormChange((prev) => ({ ...prev, body: event.target.value }))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                    />
                  </label>

                  <label className="block space-y-1 text-xs">
                    <span className="text-slate-600">Image URL</span>
                    <input
                      value={postForm.imageUrl}
                      onChange={(event) => onPostFormChange((prev) => ({ ...prev, imageUrl: event.target.value }))}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={postForm.pinned}
                      onChange={(event) => onPostFormChange((prev) => ({ ...prev, pinned: event.target.checked }))}
                    />
                    Закрепить вверху
                  </label>

                  <button
                    type="submit"
                    className="inline-flex h-8 items-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Опубликовать
                  </button>
                </form>
              ) : null}

              <div className="mt-3 space-y-2">
                {posts.slice(0, 4).map((post) => (
                  <article key={post.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {postTypeLabels[post.type]}
                      </span>
                      {post.pinned ? (
                        <span className="rounded-full border border-slate-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          Закреплено
                        </span>
                      ) : null}
                      <span className="text-[11px] text-slate-500">{formatPostDate(post.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{post.title}</p>
                    <p className="line-clamp-2 text-sm text-slate-600">{post.body}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-sm font-semibold text-slate-900">Аудитория и вовлечение</p>
              <p className="mt-1 text-sm text-slate-600">
                Используйте посты, купоны и закрепления, чтобы направлять аудиторию в актуальные подборки витрины.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Числовые метрики подписок и loyalty вынесены в блок аналитики, здесь только action-уровень.
              </p>
              <button
                type="button"
                onClick={() => onShowMockMessage("Механика подписок появится в следующей итерации.")}
                className="mt-3 inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Посмотреть, как это работает
              </button>
            </div>
          </div>
        </article>

        <article
          id="dashboard-store-settings"
          className={getSectionClassName(
            "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
            "dashboard-store-settings",
          )}
        >
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Настройки магазина</h2>
          <form onSubmit={onSettingsSave} className="mt-3 space-y-3">
            <label className="block space-y-1 text-sm">
              <span className="text-slate-600">Название магазина</span>
              <input
                value={settings.storefrontName}
                onChange={(event) => onSettingsChange((prev) => ({ ...prev, storefrontName: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-600">Тип продавца</span>
              <select
                value={settings.sellerType}
                onChange={(event) =>
                  onSettingsChange((prev) => ({ ...prev, sellerType: event.target.value as SellerType }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              >
                <option value="private_seller">{getSellerTypeLabel("private_seller")}</option>
                <option value="store_business">{getSellerTypeLabel("store_business")}</option>
                <option value="agriculture_oriented">{getSellerTypeLabel("agriculture_oriented")}</option>
                <option value="electronics_oriented">{getSellerTypeLabel("electronics_oriented")}</option>
              </select>
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-600">Описание магазина</span>
              <textarea
                value={settings.shortDescription}
                onChange={(event) => onSettingsChange((prev) => ({ ...prev, shortDescription: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-sm">
                <span className="text-slate-600">Город</span>
                <input
                  value={settings.city}
                  onChange={(event) => onSettingsChange((prev) => ({ ...prev, city: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-slate-600">Регион</span>
                <input
                  value={settings.region}
                  onChange={(event) => onSettingsChange((prev) => ({ ...prev, region: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-600">Телефон</span>
              <input
                value={settings.phone}
                onChange={(event) => onSettingsChange((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-sm">
                <span className="text-slate-600">Сайт</span>
                <input
                  value={settings.website}
                  onChange={(event) => onSettingsChange((prev) => ({ ...prev, website: event.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-slate-600">Telegram</span>
                <input
                  value={settings.telegram}
                  onChange={(event) => onSettingsChange((prev) => ({ ...prev, telegram: event.target.value }))}
                  placeholder="@shop"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </label>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-slate-600">VK</span>
              <input
                value={settings.vk}
                onChange={(event) => onSettingsChange((prev) => ({ ...prev, vk: event.target.value }))}
                placeholder="vk.com/shop"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Сохранить
            </button>
          </form>
        </article>
      </section>

      <StoreDashboardTourModal
        isOpen={tourModal.isOpen}
        tourStepIndex={tourModal.tourStepIndex}
        activeTourStep={tourModal.activeTourStep}
        onClose={tourModal.onClose}
        onBack={tourModal.onBack}
        onNextOrComplete={tourModal.onNextOrComplete}
      />

      <StoreDashboardTariffModal isOpen={tariffModal.isOpen} onClose={tariffModal.onClose} />
    </>
  );
}
