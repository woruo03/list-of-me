<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.85"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="app-icon"
    aria-hidden="true"
  >
    <template v-if="name === 'menu'">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </template>

    <template v-else-if="name === 'inbox'">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9z" />
      <path d="M3 12h5l2 3h4l2-3h5" />
    </template>

    <template v-else-if="name === 'calendar'">
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M8 3v3.5" />
      <path d="M16 3v3.5" />
      <path d="M3 9.5h18" />
    </template>

    <template v-else-if="name === 'folder'">
      <path d="M3 8a2 2 0 0 1 2-2h4.5l2 2H19a2 2 0 0 1 2 2v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17V8z" />
    </template>

    <template v-else-if="name === 'check-circle'">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.2 2.2 4.8-4.8" />
    </template>

    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.1" />
      <path d="M12 19.1v2.1" />
      <path d="m4.9 4.9 1.5 1.5" />
      <path d="m17.6 17.6 1.5 1.5" />
      <path d="M2.8 12h2.1" />
      <path d="M19.1 12h2.1" />
      <path d="m4.9 19.1 1.5-1.5" />
      <path d="m17.6 6.4 1.5-1.5" />
    </template>

    <template v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.7-3.7" />
    </template>

    <template v-else-if="name === 'plus'">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </template>

    <template v-else-if="name === 'close'">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </template>

    <template v-else-if="name === 'pencil'">
      <path d="m16.5 3.5 4 4L8 20l-4 1 1-4 11.5-13.5z" />
    </template>

    <template v-else-if="name === 'trash'">
      <path d="M3 6h18" />
      <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
      <path d="M6.5 6 7.3 19a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9L17.5 6" />
      <path d="M10 10v7" />
      <path d="M14 10v7" />
    </template>

    <template v-else-if="name === 'note'">
      <path d="M7 3h10l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 3v4h4" />
      <path d="M9 12h8" />
      <path d="M9 16h6" />
    </template>

    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </template>

    <template v-else-if="name === 'checklist'">
      <path d="M8 4h8l3 3v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M16 4v3h3" />
      <path d="m9 12 1.5 1.5 2.5-2.5" />
      <path d="M9 17h6" />
    </template>

    <template v-else-if="name === 'arrow-left'">
      <path d="m15 18-6-6 6-6" />
      <path d="M9 12h11" />
    </template>

    <template v-else-if="name === 'chevron-left'">
      <path d="m15 18-6-6 6-6" />
    </template>

    <template v-else-if="name === 'chevron-right'">
      <path d="m9 18 6-6-6-6" />
    </template>

    <template v-else-if="name === 'check'">
      <path d="m5 12 4 4 10-10" />
    </template>

    <template v-else-if="name === 'grip'">
      <circle cx="9" cy="8" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="9" cy="16" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15" cy="8" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="15" cy="16" r="1.15" fill="currentColor" stroke="none" />
    </template>

    <template v-else>
      <circle cx="12" cy="12" r="9" />
    </template>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  name: string
  size?: number
}

withDefaults(defineProps<Props>(), {
  size: 18,
})
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
}

.app-icon {
  vector-effect: non-scaling-stroke;
  shape-rendering: geometricPrecision;
}
</style>
