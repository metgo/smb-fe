// components/shared/StatsMarquee.tsx
import { useId } from "react";
import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";

export interface StatItem {
    id: string | number;
    title: string;
    value: number | string | undefined;
    label?: string;
    icon: React.ReactNode;
}

interface StatsMarqueeProps {
    stats: StatItem[];
    isLoading?: boolean;
    loadingCount?: number;
    speed?: number; // seconds for one full loop
    pauseOnHover?: boolean;
    className?: string;
    cardClassName?: string;
    "data-tour"?: string;
}

export function StatsMarquee({
    stats,
    isLoading = false,
    loadingCount = 6,
    speed = 25,
    pauseOnHover = true,
    className,
    cardClassName,
    ...rest
}: StatsMarqueeProps) {
    const { isDark } = useThemeClasses();
    // Unique per-instance animation name so multiple marquees on one page don't collide
    const animId = useId().replace(/:/g, "");
    const animName = `marquee-${animId}`;

    if (isLoading) {
        return (
            <div className={clsx("flex flex-row items-center gap-2 py-0.5", className)} {...rest}>
                {Array.from({ length: loadingCount }).map((_, i) => (
                    <div
                        key={i}
                        className="shrink-0 w-36 h-10 md:w-44 md:h-12 rounded-xl bg-gray-800/40 animate-pulse border border-gray-800"
                    />
                ))}
            </div>
        );
    }

    if (!stats?.length) return null;

    return (
        <div
            dir="ltr"
            className={clsx("flex-1 min-w-0 overflow-hidden relative", className)}
            {...rest}
        >
            <style>{`
        @keyframes ${animName} {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .${animName}-track {
          animation: ${animName} ${speed}s linear infinite;
        }
        ${pauseOnHover ? `.${animName}-track:hover { animation-play-state: paused; }` : ""}
      `}</style>

            <div className={clsx("flex w-max py-0.5", `${animName}-track`)}>
                {/* Duplicate the list for a seamless loop */}
                {[...stats, ...stats].map((item, idx) => (
                    <div
                        key={`${item.id}-${idx}`}
                        className={clsx(
                            "shrink-0 flex items-center gap-2.5 px-3 py-1.5 mr-2 md:gap-3 md:px-4 md:py-2.5 md:mr-3 rounded-xl border transition-all shadow-2xs hover:border-teal-500/40 cursor-default",
                            isDark
                                ? "bg-gray-900/90 border-gray-800/90 text-gray-200"
                                : "bg-gray-50 border-gray-200 text-gray-800",
                            cardClassName
                        )}
                    >
                        <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                            {item.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-baseline gap-1">
                                <span className="text-xs md:text-sm font-bold leading-none">{item.value ?? 0}</span>
                                {item.label && (
                                    <span className="text-[9px] md:text-[11px] text-gray-400 leading-none truncate max-w-16 md:max-w-20">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] md:text-xs text-gray-400 leading-tight truncate max-w-24 md:max-w-32">
                                {item.title}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StatsMarquee;