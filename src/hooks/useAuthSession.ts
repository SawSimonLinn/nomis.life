"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Models } from "appwrite";

export function useAuthSession() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account
      .get()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
