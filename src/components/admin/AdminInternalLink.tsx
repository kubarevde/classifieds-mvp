"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { useAdminConsole } from "./admin-console-context";

type LinkProps = ComponentProps<typeof Link>;

/** Внутренняя ссылка админки с сохранением `?internalAccess=`. */
export function AdminInternalLink({ href, ...rest }: LinkProps) {
  const { appendAdminHref } = useAdminConsole();
  const to = typeof href === "string" ? appendAdminHref(href) : href;
  return <Link href={to} {...rest} />;
}
