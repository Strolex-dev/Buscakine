<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'
import AutocompleteField from '@/components/shared/AutocompleteField.vue'

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ sent: [] }>()

const formValues = reactive<{ kinesiologists: (number | string)[]; message_text: string }>({ kinesiologists: [], message_text: '' })
const loading = ref(false)

watch(open, (isOpen) => {
  if (isOpen) Object.assign(formValues, { kinesiologists: [], message_text: '' })
})

async function handleSend() {
  loading.value = true
  const response = await useApiRequest<{ status: string }>().execute({ url: '/messages/sendMultiple', method: 'POST', body: formValues })
  loading.value = false
  if (response.status === 'success') {
    emit('sent')
    open.value = false
  }
}
</script>

<template>
  <q-dialog v-model="open">
    <q-card style="min-width: 400px">
      <q-card-section><div class="text-h6">Enviar Nuevo Mensaje</div></q-card-section>
      <q-card-section class="q-gutter-md">
        <AutocompleteField label="Kinesiólogos" endpoint="/kinesiologists/list" multiple v-model="formValues.kinesiologists" />
        <q-input v-model="formValues.message_text" label="Mensaje" type="textarea" outlined dense />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="open = false" />
        <q-btn unelevated color="primary" :loading="loading" label="Enviar" @click="handleSend" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
