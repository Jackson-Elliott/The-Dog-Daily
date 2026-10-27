export const DESIGN_COOKIE = "dd_design";
export const DESIGN_IDS = [1, 2, 3] as const;
export const DEFAULT_DESIGN = 1;

export type DesignId = (typeof DESIGN_IDS)[number];

export function isDesignId(value: unknown): value is DesignId {
  return value === 1 || value === 2 || value === 3;
}

export function parseDesign(value: string | undefined | null): DesignId {
  if (!value) return DEFAULT_DESIGN;
  const parsed = Number(value);
  return isDesignId(parsed) ? parsed : DEFAULT_DESIGN;
}
