"use client";

import { useState, useEffect, useCallback } from "react";
import type { VillageData, VillageBuilding, BuildingType } from "@/lib/village/types";

export function useVillage() {
  const [buildings, setBuildings] = useState<VillageBuilding[]>([]);
  const [stats, setStats] = useState({ totalSessions: 0, totalFocusMinutes: 0, currentStreak: 0 });
  const [unlockedTypes, setUnlockedTypes] = useState<BuildingType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVillage = useCallback(async () => {
    try {
      const res = await fetch("/api/focus/village");
      if (res.ok) {
        const data: VillageData = await res.json();
        setBuildings(data.buildings);
        setStats(data.stats);
        setUnlockedTypes(data.unlockedTypes);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVillage();
  }, [fetchVillage]);

  const placeBuilding = useCallback(async (buildingType: BuildingType): Promise<VillageBuilding | null> => {
    try {
      const res = await fetch("/api/focus/village", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildingType }),
      });
      if (res.ok) {
        const building: VillageBuilding = await res.json();
        setBuildings((prev) => [...prev, building]);
        // Refresh stats
        fetchVillage();
        return building;
      }
    } catch {
      // silently fail
    }
    return null;
  }, [fetchVillage]);

  return { buildings, stats, unlockedTypes, loading, fetchVillage, placeBuilding };
}
