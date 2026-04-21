import { FormField } from "@/components/create-listing/form-field";
import { Input } from "@/components/create-listing/input";
import { Textarea } from "@/components/create-listing/textarea";

import type { ProfilePersistedFields } from "./types";

type ProfileFormProps = {
  value: Pick<ProfilePersistedFields, "name" | "city" | "phone" | "description">;
  onChange: (patch: Partial<ProfilePersistedFields>) => void;
};

export function ProfileForm({ value, onChange }: ProfileFormProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-900">Редактирование</h2>
        <p className="text-xs text-slate-600">Имя, город, телефон и описание сохраняются локально.</p>
      </div>
      <div className="mt-4 space-y-4">
        <FormField label="Имя" htmlFor="profile-name">
          <Input
            id="profile-name"
            name="name"
            autoComplete="name"
            value={value.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Как к вам обращаться"
          />
        </FormField>
        <FormField label="Город" htmlFor="profile-city">
          <Input
            id="profile-city"
            name="city"
            autoComplete="address-level2"
            value={value.city}
            onChange={(event) => onChange({ city: event.target.value })}
            placeholder="Город проживания"
          />
        </FormField>
        <FormField label="Телефон" htmlFor="profile-phone">
          <Input
            id="profile-phone"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            value={value.phone}
            onChange={(event) => onChange({ phone: event.target.value })}
            placeholder="+7 ..."
          />
        </FormField>
        <FormField
          label="Краткое описание"
          htmlFor="profile-description"
          hint="Пару предложений о себе — это видно на карточке продавца."
        >
          <Textarea
            id="profile-description"
            name="description"
            rows={4}
            value={value.description}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="Например: предпочитаю встречи у метро, торг уместен."
          />
        </FormField>
      </div>
    </section>
  );
}
