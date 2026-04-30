/** Сохраняет `internalAccess` при навигации внутри админки (mock ACL). */
export function appendInternalAccessToHref(href: string, internalAccess: string | null | undefined): string {
  if (!internalAccess) {
    return href;
  }
  const [path, query = ""] = href.split("?");
  const usp = new URLSearchParams(query);
  usp.set("internalAccess", internalAccess);
  const q = usp.toString();
  return q ? `${path}?${q}` : path;
}

/** Самый длинный href из списка, совпадающий с pathname (для active state в подменю). */
export function pickDeepestNavHrefMatch(pathname: string, hrefs: readonly string[]): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/admin";
  const matches = hrefs.filter((h) => normalized === h || normalized.startsWith(`${h}/`));
  if (!matches.length) {
    return null;
  }
  return [...matches].sort((a, b) => b.length - a.length)[0] ?? null;
}
