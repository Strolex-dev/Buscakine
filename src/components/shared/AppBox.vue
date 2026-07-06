<script setup lang="ts">
withDefaults(
  defineProps<{
    boxClass?: string
    title?: string
    subtitle?: string
  }>(),
  { boxClass: '', title: '', subtitle: '' },
)

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <div class="box" :class="boxClass" @click="$emit('click', $event)">
    <div class="box_children">
      <div v-if="title" class="box_header">
        <h2 class="card_title">{{ title }}</h2>
        <span class="card_subtitle">{{ subtitle }}</span>
      </div>
      <div class="box_content">
        <slot />
      </div>
    </div>
  </div>
</template>
