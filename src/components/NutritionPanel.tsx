import { useState } from 'react';
import { generateNutritionRecommendations, type NutritionCategory, type SkinMetricsInput } from '@/lib/skinNutritionEngine';

interface NutritionPanelProps {
  metrics: SkinMetricsInput;
}

export default function NutritionPanel({ metrics }: NutritionPanelProps) {
  const categories = generateNutritionRecommendations(metrics);
  const [expanded, setExpanded] = useState<string | null>(categories[0]?.key ?? null);

  return (
    <div className="glass-panel">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'hsl(var(--teal-light))' }}>
          <span className="text-lg">🥗</span>
        </div>
        <div>
          <h2 className="text-section-title">Nutrition Recommendations</h2>
          <p className="text-micro text-muted-foreground">Foods that may support your skin wellness</p>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const isOpen = expanded === cat.key;
          const isLow = cat.priority < 70;

          return (
            <div
              key={cat.key}
              className="rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                background: isOpen ? 'hsl(var(--card))' : 'hsl(var(--muted))',
                border: isOpen ? '1px solid hsl(var(--border))' : '1px solid transparent',
              }}
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : cat.key)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors"
              >
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-card-title truncate">{cat.title}</p>
                    {isLow && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          background: 'hsl(var(--destructive) / 0.1)',
                          color: 'hsl(var(--destructive))',
                        }}
                      >
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-micro text-muted-foreground truncate">{cat.foods.length} foods recommended</p>
                </div>

                {/* Score indicator */}
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 rounded-full overflow-hidden" style={{ background: 'hsl(var(--border))' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.priority}%`,
                        background: cat.priority >= 70
                          ? 'hsl(var(--teal))'
                          : cat.priority >= 50
                            ? 'hsl(var(--accent))'
                            : 'hsl(var(--destructive))',
                      }}
                    />
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 text-muted-foreground transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>

              {/* Expandable content */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isOpen ? '600px' : '0',
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="px-4 pb-4">
                  <p className="text-micro text-muted-foreground mb-4">{cat.description}</p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {cat.foods.map((food) => (
                      <div
                        key={food.name}
                        className="flex items-start gap-3 rounded-xl p-3 transition-colors"
                        style={{ background: 'hsl(var(--muted))' }}
                      >
                        <span className="mt-0.5 text-lg shrink-0">{food.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{food.name}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{food.benefit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 rounded-xl p-3 text-center" style={{ background: 'hsl(var(--lavender-light))' }}>
        <p className="text-xs text-muted-foreground">
          ℹ️ These are general nutrition suggestions, not medical or dietary prescriptions. Consult a healthcare professional for personalized advice.
        </p>
      </div>
    </div>
  );
}
