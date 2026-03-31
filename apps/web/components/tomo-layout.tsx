"use client";

import { useCallback } from "react";
import { tomoStore, useTomoActive } from "@/components/tomo-toggle";
import { WalkingCharacter } from "@/components/walking-character";

export function TomoLayout() {
  const active = useTomoActive();

  const getAnchorX = useCallback(() => tomoStore.getAnchorX(), []);

  return <WalkingCharacter active={active} getAnchorX={getAnchorX} />;
}
