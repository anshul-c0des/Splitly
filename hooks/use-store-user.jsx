"use client";

import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function useStoreUser() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { user } = useUser();
  const [userId, setUserId] = useState(null);
  const [isStoring, setIsStoring] = useState(false);

  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function createUser() {
      setIsStoring(true);
      try {
        const id = await storeUser();
        setUserId(id);
      } catch (err) {
        console.error("Failed to store user:", err);
      } finally {
        setIsStoring(false);
      }
    }

    createUser();

    return () => setUserId(null);
  }, [isAuthenticated, storeUser, user?.id]);

  return {
    userId,
    isLoading: authLoading || isStoring, // 👈 combine auth and store loading
  };
}
