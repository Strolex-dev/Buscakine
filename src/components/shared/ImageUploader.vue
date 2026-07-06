<script setup lang="ts">
withDefaults(defineProps<{ image: string; uploaderClass?: string; disabled?: boolean; label?: string }>(), {
  uploaderClass: '',
  disabled: false,
  label: 'Imagen',
})

const emit = defineEmits<{
  'update:image': [image: string]
  'update:file': [file: File]
}>()

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file && file.type.startsWith('image/')) {
    emit('update:file', file)
    emit('update:image', URL.createObjectURL(file))
  }
}

function handleDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    emit('update:file', file)
    emit('update:image', URL.createObjectURL(file))
  }
}
</script>

<template>
  <div class="drawerImagesContainerDiv" :class="uploaderClass" @drop.prevent="handleDrop" @dragover.prevent @dragleave.prevent>
    <img v-if="image" :src="image" />
    <label id="dropFileDiv" :class="{ showOnlyOnHover: !!image }" :style="disabled ? { display: 'none' } : {}">
      <q-btn class="addFile_button" flat dense icon="photo_camera" :label="label" no-caps>
        <input type="file" hidden accept="image/*" @change="handleFileChange" />
      </q-btn>
    </label>
  </div>
</template>
