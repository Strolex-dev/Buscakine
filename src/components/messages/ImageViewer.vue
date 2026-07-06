<script setup lang="ts">
defineProps<{ imageSrc: string }>()
const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <q-dialog v-model="open">
    <img :src="imageSrc" alt="Imagen" style="width: 100%; height: auto" />
  </q-dialog>
</template>
