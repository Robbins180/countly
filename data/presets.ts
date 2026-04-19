export type Preset = {
  title: string;
  emoji: string;
  targetDays: number;
  category: string;
};

export const PRESETS: Preset[] = [
  { title: "Haircut", emoji: "💇", targetDays: 30, category: "personal" },
  { title: "Oil Change", emoji: "🛢️", targetDays: 90, category: "home" },
  { title: "Workout", emoji: "🏋️", targetDays: 2, category: "health" },
  { title: "Medication", emoji: "💊", targetDays: 1, category: "health" },
  { title: "Call Family", emoji: "📞", targetDays: 7, category: "personal" },
];
