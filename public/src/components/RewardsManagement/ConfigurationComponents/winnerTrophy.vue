<template>
  <div class="trophy-wrapper">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Glow -->
      <circle cx="32" cy="28" r="22" class="glow" />

      <!-- Trophy Cup -->
      <path
        d="M18 10H46V22C46 30 40 36 32 36C24 36 18 30 18 22V10Z"
        fill="url(#grad)"
      />

      <!-- Handles -->
      <path
        d="M18 12C12 12 10 16 10 20C10 24 14 28 18 28"
        stroke="#ff4da6"
        stroke-width="2"
        fill="none"
      />
      <path
        d="M46 12C52 12 54 16 54 20C54 24 50 28 46 28"
        stroke="#ff4da6"
        stroke-width="2"
        fill="none"
      />

      <!-- Star -->
      <polygon
        points="32,18 34,24 40,24 35,28 37,34 32,30 27,34 29,28 24,24 30,24"
        fill="#fff"
      />

      <!-- Stem -->
      <rect x="28" y="36" width="8" height="8" rx="2" fill="url(#grad)" />

      <!-- Base -->
      <rect x="22" y="44" width="20" height="6" rx="3" fill="url(#grad)" />
      <rect x="20" y="50" width="24" height="6" rx="3" fill="#dd4d78" />

      <!-- Gradient -->
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stop-color="#ff7ac6" />
          <stop offset="100%" stop-color="#dd4d78" />
        </linearGradient>
      </defs>
    </svg>
  </div>
</template>

<script>
export default {
  name: "WinnerTrophy",
  props: {
    size: {
      type: Number,
      default: 80,
    },
  },
};
</script>

<style scoped>
.trophy-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Glow effect */
.glow {
  fill: #ff4da6;
  opacity: 0.12;
}

/* Hover animation */
.trophy-wrapper svg {
  transition: transform 0.3s ease;
}
.trophy-wrapper svg:hover {
  transform: scale(1.08);
}
</style>