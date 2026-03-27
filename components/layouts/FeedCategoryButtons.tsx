"use client";

import { AnimatePresence, motion } from "motion/react";
import useGeneralStore from "@/stores/generalStore";
import { useState } from "react";

export const CATEGORY_COLORS = [
  "from-pink-500 to-rose-500",
  "from-teal-400 to-cyan-500",
  "from-violet-500 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-green-500",
  "from-orange-500 to-red-500",
  "from-fuchsia-500 to-pink-500",
];

export default function FeedCategoryButtons() {
  const { presetFeedFilters, selectedSiteCategories, toggleSiteCategory } =
    useGeneralStore();
  const topics = presetFeedFilters?.siteTopics ?? [];

  const [selectedTopic, setSelectedTopic] = useState<string | null>(
    topics[0]?.title ?? null,
  );
  const activeTopic = topics.find((t) => t.title === selectedTopic);

  const allCategories =
    presetFeedFilters?.siteTopics?.flatMap(
      (topic) => topic.siteCategories ?? [],
    ) ?? [];

  if (allCategories.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Level 1: Topics */}
      <motion.div className="flex flex-wrap gap-3 justify-center">
        {topics.map((topic, idx) => {
          const isActive = selectedTopic === topic.title;
          const gradient = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

          return (
            <motion.button
              key={topic.title}
              whileTap={{ scale: 0.86 }}
              onClick={() => setSelectedTopic(isActive ? null : topic.title)}
              className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 justify-center text-sm font-medium ${
                isActive
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                  : "bg-white/80 text-gray-700 hover:bg-white shadow-md"
              }`}
            >
              {topic.title}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Level 2: Categories for the selected topic */}
      <div className="gap-2 flex ">
        <AnimatePresence>
          {(activeTopic?.siteCategories ?? []).map((category) => {
            const isActive = selectedSiteCategories?.some(
              (c) => c.title === category.title,
            );
            const idx = allCategories.findIndex(
              (c) => c.title === category.title,
            );
            const gradient = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

            return (
              <motion.button
                key={category.title}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleSiteCategory(category)}
                className={`px-4 py-2 rounded-lg transition-all text-xs font-medium ${
                  isActive
                    ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                    : "bg-white/60 text-gray-600 hover:bg-white shadow-sm border border-gray-200"
                }`}
              >
                {category.title}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
