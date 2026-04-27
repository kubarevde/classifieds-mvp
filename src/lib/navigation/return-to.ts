export function buildReturnTo(pathname: string, search: string) {
  if (!search) {
    return pathname;
  }
  return `${pathname}${search.startsWith("?") ? search : `?${search}`}`;
}

export function sanitizeReturnTo(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  if (!value.startsWith("/")) {
    return null;
  }
  if (value.startsWith("//")) {
    return null;
  }
  return value;
}

export function withReturnTo(href: string | undefined, returnTo: string) {
  if (!href) {
    return href;
  }
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set("returnTo", returnTo);
  const nextQuery = params.toString();
  return nextQuery ? `${path}?${nextQuery}` : path;
}
