"use client";

interface VillageHudProps {
  weather?: "clear" | "snow" | "rain";
  onToggleWeather?: () => void;
}

const WEATHER_LABELS: Record<string, string> = {
  clear: "Clear",
  snow: "Snow",
  rain: "Rain",
};

export function VillageHud({ weather = "clear", onToggleWeather }: VillageHudProps) {
  return (
    <>
      {onToggleWeather && (
        <button
          onClick={onToggleWeather}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            zIndex: 10,
          }}
        >
          Weather: {WEATHER_LABELS[weather]}
        </button>
      )}
    </>
  );
}
