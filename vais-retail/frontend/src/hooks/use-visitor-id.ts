import { getCookie, setCookie } from "cookies-next";
import { useState } from "react";

const VISITOR_ID_KEY = "visitorId";

export function useVisitorId() {
  const [visitorId, setVisitorId] = useState(
    () => getCookie(VISITOR_ID_KEY) as string
  );

  function setVisitorIdWithCookie(value: string | ((val: string) => string)) {
    const resolvedValue =
      typeof value === "function" ? value(visitorId) : value;
    setVisitorId(resolvedValue);
    setCookie(VISITOR_ID_KEY, resolvedValue);
  }

  return [visitorId, setVisitorIdWithCookie] as const;
}
