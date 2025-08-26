import { getCookie, setCookie } from "cookies-next";
import { useLocalStorage } from "usehooks-ts";

const VISITOR_ID_KEY = "visitorId";

export function useVisitorId() {
  const [visitorId, setVisitorId] = useLocalStorage(
    VISITOR_ID_KEY,
    (getCookie(VISITOR_ID_KEY) as string) || "visitor-1"
  );

  const setVisitorIdWithCookie = (
    value: string | ((val: string) => string)
  ) => {
    const resolvedValue =
      typeof value === "function" ? value(visitorId) : value;
    setVisitorId(resolvedValue);
    setCookie(VISITOR_ID_KEY, resolvedValue);
  };

  return [visitorId, setVisitorIdWithCookie] as const;
}
