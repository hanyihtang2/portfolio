/**
 * Sibling Repository Extractors Registry
 */

export * from "./types.ts";
export { PlateMarkExtractor } from "./platemark.ts";
export { MakerExtractor } from "./maker.ts";
export { CommuteShiftExtractor } from "./commuteshift.ts";

import { PlateMarkExtractor } from "./platemark.ts";
import { MakerExtractor } from "./maker.ts";
import { CommuteShiftExtractor } from "./commuteshift.ts";
import type { ProjectExtractor } from "./types.ts";

export const ALL_EXTRACTORS: Record<string, ProjectExtractor> = {
  platemark: PlateMarkExtractor,
  maker: MakerExtractor,
  commuteshift: CommuteShiftExtractor,
};

