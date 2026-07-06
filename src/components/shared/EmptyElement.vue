<script setup lang="ts">
import icEmpty from '@/assets/ic_empty.svg'

defineProps<{ title?: string; subtitle?: string }>()
</script>

<template>
  <div class="empty_element">
    <div class="empty_element_content">
      <img :src="icEmpty" alt="" class="ic_empty" />
      <span class="empty_element_title">{{ title }}</span>
      <span class="empty_element_subtitle">{{ subtitle }}</span>
    </div>
  </div>
</template>
