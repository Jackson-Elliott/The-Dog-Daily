"use client";

import { SUBCATEGORIES, isCategory } from "@/lib/categories";
import { STORY_LEVELS, STORY_LEVEL_LABELS, normalizeStoryLevel, type StoryLevel } from "@/lib/levels";
import { adminFieldClass, adminLabelClass, adminMutedClass } from "@/components/admin-ui";

/** Level, sub-topic and summary fields shared by the upload form and the episode editor. */
export default function AdminStoryDetails({
  idPrefix,
  category,
  subcategory,
  summary,
  level,
  onSubcategoryChange,
  onSummaryChange,
  onLevelChange,
}: {
  idPrefix: string;
  category: string;
  subcategory: string;
  summary: string;
  level: StoryLevel;
  onSubcategoryChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onLevelChange: (value: StoryLevel) => void;
}) {
  const options = isCategory(category) ? SUBCATEGORIES[category] : [];

  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-level`} className={adminLabelClass}>
          Level (how big the story appears on Designs 2 and 3)
        </label>
        <select
          id={`${idPrefix}-level`}
          value={level}
          onChange={(event) => onLevelChange(normalizeStoryLevel(event.target.value))}
          className={adminFieldClass}
        >
          {STORY_LEVELS.map((option) => (
            <option key={option} value={option}>
              {STORY_LEVEL_LABELS[option]}
            </option>
          ))}
        </select>
        <p className={`mt-1 ${adminMutedClass}`}>
          Hero stories take the biggest spot. Brief stories sit in the smallest.
        </p>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-subcategory`} className={adminLabelClass}>
          Sub-topic (groups stories into sections on Design 2)
        </label>
        <select
          id={`${idPrefix}-subcategory`}
          value={options.includes(subcategory) ? subcategory : ""}
          onChange={(event) => onSubcategoryChange(event.target.value)}
          disabled={options.length === 0}
          className={`${adminFieldClass} disabled:opacity-40`}
        >
          <option value="">{options.length === 0 ? "Pick a category first" : "None"}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-summary`} className={adminLabelClass}>
          Summary (one sentence, shown on larger Design 2 cards)
        </label>
        <textarea
          id={`${idPrefix}-summary`}
          value={summary}
          onChange={(event) => onSummaryChange(event.target.value)}
          rows={2}
          className={`${adminFieldClass} resize-y`}
          placeholder="A short, factual sentence about the story"
        />
        <p className={`mt-1 ${adminMutedClass}`}>Aim for 20 to 25 words.</p>
      </div>
    </>
  );
}
