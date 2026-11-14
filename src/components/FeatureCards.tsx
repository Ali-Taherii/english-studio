import type { Dictionary } from "@/i18n/dictionaries";

// Outline icons (Lucide paths), in the order of about.features: speech bubble, checked page, chart.
const icons = [
  <path key="chat" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  <g key="file">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="m9 15 2 2 4-4" />
  </g>,
  <g key="chart">
    <path d="M3 3v18h18" />
    <path d="m7 15 4-4 3 3 5-6" />
  </g>,
];

export function FeatureCards({ features }: { features: Dictionary["about"]["features"] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
      {features.map((feature, index) => (
        <div key={feature.title} className="flex flex-col gap-2 rounded-md border border-border bg-surface-0 p-5">
          <svg
            aria-hidden="true"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand"
          >
            {icons[index % icons.length]}
          </svg>
          <h3 className="text-lg font-semibold">{feature.title}</h3>
          <p className="text-sm text-ink-muted">{feature.text}</p>
        </div>
      ))}
    </div>
  );
}
