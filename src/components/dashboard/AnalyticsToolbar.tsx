import { type ReactNode } from "react";
import { BarChart3, ChevronDown, FileText, ListOrdered, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

export type AnalyticsSegmentValue = "statistics" | "trade-history" | "custom-reports";

export interface SegmentOption {
  value: AnalyticsSegmentValue;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface AnalyticsToolbarProps {
  segments?: SegmentOption[];
  activeSegment: AnalyticsSegmentValue;
  onSegmentChange?: (value: AnalyticsSegmentValue) => void;
  strategy: string;
  timeframe: string;
  venue: string;
  market: string;
  onStrategyChange: (value: string) => void;
  onTimeframeChange: (value: string) => void;
  onVenueChange: (value: string) => void;
  onMarketChange: (value: string) => void;
  strategyOptions: FilterOption[];
  timeframeOptions: FilterOption[];
  venueOptions: FilterOption[];
  marketOptions: FilterOption[];
  rightSlot?: ReactNode;
}

const defaultSegments: SegmentOption[] = [
  {
    value: "statistics",
    label: "Statistics Dashboard",
    icon: BarChart3
  },
  {
    value: "trade-history",
    label: "Trade History",
    icon: ListOrdered,
    badge: 57
  },
  {
    value: "custom-reports",
    label: "Custom Reports",
    icon: FileText
  }
];

export const AnalyticsToolbar = ({
  segments = defaultSegments,
  activeSegment,
  onSegmentChange,
  strategy,
  timeframe,
  venue,
  market,
  onStrategyChange,
  onTimeframeChange,
  onVenueChange,
  onMarketChange,
  strategyOptions,
  timeframeOptions,
  venueOptions,
  marketOptions,
  rightSlot
}: AnalyticsToolbarProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {segments.map((segment) => {
            const Icon = segment.icon;
            const isActive = segment.value === activeSegment;

            return (
              <button
                key={segment.value}
                type="button"
                disabled={segment.disabled}
                onClick={() => onSegmentChange?.(segment.value)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition",
                  isActive
                    ? "bg-primary text-background shadow-[0_10px_35px_rgba(255,198,0,0.35)]"
                    : "text-white/70 hover:text-white",
                  segment.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{segment.label}</span>
                {typeof segment.badge !== "undefined" ? (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-full bg-white/10 text-[11px] font-semibold uppercase tracking-wide",
                      isActive ? "bg-background/20 text-background" : "text-white/70"
                    )}
                  >
                    {segment.badge}
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </div>
        {rightSlot}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          label="Strategy"
          value={strategy}
          options={strategyOptions}
          onValueChange={onStrategyChange}
        />
        <FilterSelect
          label="Timeframe"
          value={timeframe}
          options={timeframeOptions}
          onValueChange={onTimeframeChange}
        />
        <FilterSelect label="Venue" value={venue} options={venueOptions} onValueChange={onVenueChange} />
        <FilterSelect label="Pair" value={market} options={marketOptions} onValueChange={onMarketChange} />
      </div>
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onValueChange: (value: string) => void;
}

const FilterSelect = ({ label, value, options, onValueChange }: FilterSelectProps) => {
  const selected = options.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-20 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-left text-white transition hover:border-white/30 focus:border-primary focus:ring-0">
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/50">{label}</p>
            <p className="text-base font-semibold text-white">{selected?.label ?? "Select"}</p>
            {selected?.description ? (
              <span className="text-xs text-white/60">{selected.description}</span>
            ) : null}
          </div>
          <ChevronDown className="h-4 w-4 text-white/60" />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-2xl border border-white/10 bg-[#050505] text-white shadow-2xl">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 focus:bg-white/10 focus:text-white"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{option.label}</span>
              {option.description ? <span className="text-xs text-white/60">{option.description}</span> : null}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
