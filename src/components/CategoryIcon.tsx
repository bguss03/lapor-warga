import {
  Trash2,
  Shield,
  Building,
  AlertTriangle,
  Wrench,
  TreePine,
  Droplets,
  Zap,
  Heart,
  GraduationCap,
  Stethoscope,
  Construction,
  Flame,
  Bug,
  Lightbulb,
  Car,
  Home,
  MapPin,
  Pin,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

interface IconEntry {
  component: LucideIcon;
  /** Inline styles for the icon wrapper (background + icon color) */
  style: CSSProperties;
}

/**
 * Maps common icon name strings (from the database) to Lucide React components
 * and their color schemes as inline styles (to avoid Tailwind CSS purge issues).
 */
const ICON_MAP: Record<string, IconEntry> = {
  trash:          { component: Trash2,        style: { backgroundColor: "#d1fae5", color: "#059669" } },
  trash2:         { component: Trash2,        style: { backgroundColor: "#d1fae5", color: "#059669" } },
  shield:         { component: Shield,        style: { backgroundColor: "#dbeafe", color: "#2563eb" } },
  building:       { component: Building,      style: { backgroundColor: "#ede9fe", color: "#7c3aed" } },
  alerttriangle:  { component: AlertTriangle, style: { backgroundColor: "#fef3c7", color: "#d97706" } },
  alert:          { component: AlertTriangle, style: { backgroundColor: "#fef3c7", color: "#d97706" } },
  wrench:         { component: Wrench,        style: { backgroundColor: "#f1f5f9", color: "#475569" } },
  treepine:       { component: TreePine,      style: { backgroundColor: "#dcfce7", color: "#16a34a" } },
  tree:           { component: TreePine,      style: { backgroundColor: "#dcfce7", color: "#16a34a" } },
  droplets:       { component: Droplets,      style: { backgroundColor: "#cffafe", color: "#0891b2" } },
  water:          { component: Droplets,      style: { backgroundColor: "#cffafe", color: "#0891b2" } },
  zap:            { component: Zap,           style: { backgroundColor: "#fef9c3", color: "#ca8a04" } },
  heart:          { component: Heart,         style: { backgroundColor: "#ffe4e6", color: "#e11d48" } },
  graduationcap:  { component: GraduationCap, style: { backgroundColor: "#e0e7ff", color: "#4f46e5" } },
  graduation:     { component: GraduationCap, style: { backgroundColor: "#e0e7ff", color: "#4f46e5" } },
  stethoscope:    { component: Stethoscope,   style: { backgroundColor: "#ccfbf1", color: "#0d9488" } },
  construction:   { component: Construction,  style: { backgroundColor: "#ffedd5", color: "#ea580c" } },
  flame:          { component: Flame,         style: { backgroundColor: "#fee2e2", color: "#dc2626" } },
  fire:           { component: Flame,         style: { backgroundColor: "#fee2e2", color: "#dc2626" } },
  bug:            { component: Bug,           style: { backgroundColor: "#ecfccb", color: "#65a30d" } },
  lightbulb:      { component: Lightbulb,     style: { backgroundColor: "#fef9c3", color: "#ca8a04" } },
  car:            { component: Car,           style: { backgroundColor: "#e0f2fe", color: "#0284c7" } },
  home:           { component: Home,          style: { backgroundColor: "#ede9fe", color: "#7c3aed" } },
  mappin:         { component: MapPin,        style: { backgroundColor: "#ffe4e6", color: "#e11d48" } },
  pin:            { component: Pin,           style: { backgroundColor: "#fce7f3", color: "#db2777" } },
};

/**
 * Checks if a string looks like an emoji (contains characters outside basic ASCII/Latin).
 */
function isEmoji(str: string): boolean {
  const emojiRegex = /[\u{1F000}-\u{1FFFF}|\u{2600}-\u{27BF}|\u{2300}-\u{23FF}|\u{FE00}-\u{FEFF}|\u{200D}|\u{20E3}|\u{E0020}-\u{E007F}]/u;
  return emojiRegex.test(str);
}

/**
 * Normalizes an icon name string for lookup:
 * lowercases and strips hyphens, underscores, and spaces.
 */
function normalize(name: string): string {
  return name.toLowerCase().replace(/[-_\s]/g, "");
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/**
 * Given an icon string from the database, returns inline CSSProperties
 * for the icon wrapper (background color + text/icon color).
 * Returns undefined for emojis or unknown icon names.
 */
export function getCategoryIconStyle(icon: string | undefined | null): CSSProperties | undefined {
  if (!icon || isEmoji(icon)) return undefined;
  return ICON_MAP[normalize(icon)]?.style;
}

interface CategoryIconProps {
  icon: string | undefined | null;
  className?: string;
  fallback?: string;
}

/**
 * Renders a category icon — supports both emoji strings and Lucide icon names.
 * - Emoji → rendered directly as text
 * - Lucide name (e.g. "trash", "shield") → rendered as Lucide component
 * - Unknown → fallback emoji
 */
export function CategoryIcon({ icon, className = "size-6", fallback = "📌" }: CategoryIconProps) {
  if (!icon) {
    return <span>{fallback}</span>;
  }

  // If the icon is an emoji, render it directly
  if (isEmoji(icon)) {
    return <span>{icon}</span>;
  }

  // Try to match a Lucide icon by name
  const entry = ICON_MAP[normalize(icon)];

  if (entry) {
    return <entry.component className={className} />;
  }

  // Fallback: render the raw string
  return <span>{icon}</span>;
}
