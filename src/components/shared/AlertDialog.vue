<script setup lang="ts">
withDefaults(defineProps<{ subtitle?: string }>(), { subtitle: '¿Está seguro?' })
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <q-dialog v-model="open">
    <q-card>
      <q-card-section>{{ subtitle }}</q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="open = false" />
        <q-btn unelevated color="negative" label="Confirmar" @click="emit('confirm')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
