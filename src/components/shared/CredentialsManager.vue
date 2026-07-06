<script setup lang="ts">
import { ref, watch } from 'vue'
import { Notify } from 'quasar'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'

const props = defineProps<{ nurseId: number | null }>()

interface Credential {
  credential_id: number
  title: string
  image?: string
  created_at?: string
}

const credentials = ref<Credential[]>([])
const credTitle = ref('')
const credFile = ref<File | null>(null)
const previewCredential = ref<Credential | null>(null)

async function loadCredentials() {
  if (!props.nurseId) return
  const r = await useApiRequest<{ status: string; items?: Credential[]; data?: Credential[] }>().execute({
    url: '/kinesiologists/credentials',
    query: { nurse_id: props.nurseId },
  })
  if (r.status === 'success') credentials.value = r.items ?? r.data ?? []
}

watch(() => props.nurseId, loadCredentials, { immediate: true })

function onCredFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) credFile.value = f
}

async function addCredential() {
  if (!props.nurseId) {
    Notify.create({ type: 'warning', message: 'Primero guarda el perfil profesional' })
    return
  }
  if (credentials.value.length >= 3) {
    Notify.create({ type: 'warning', message: 'Solo se pueden subir hasta 3 credenciales' })
    return
  }
  if (!credTitle.value || !credFile.value) {
    Notify.create({ type: 'warning', message: 'Título e imagen son requeridos' })
    return
  }
  const body = new FormData()
  body.append('formValues', JSON.stringify({ nurse_id: props.nurseId, title: credTitle.value }))
  body.append('image', credFile.value)

  const r = await useApiRequest<{ status: string; message?: string }>().execute({
    url: '/kinesiologists/credentials',
    method: 'POST',
    formData: true,
    body,
  })
  if (r.status === 'success') {
    Notify.create({ type: 'positive', message: r.message || 'Credencial guardada' })
    credTitle.value = ''
    credFile.value = null
    loadCredentials()
  } else {
    Notify.create({ type: 'negative', message: r.message || 'No se pudo guardar' })
  }
}

async function deleteCredential(credential_id: number) {
  const r = await useApiRequest<{ status: string; message?: string }>().execute({
    url: '/kinesiologists/credentials/delete',
    method: 'POST',
    body: { credential_id },
  })
  if (r.status === 'success') {
    Notify.create({ type: 'positive', message: r.message || 'Credencial eliminada' })
    loadCredentials()
  } else {
    Notify.create({ type: 'negative', message: r.message || 'No se pudo eliminar' })
  }
}
</script>

<template>
  <div>
    <AppBox v-if="!nurseId" box-class="intent-box">
      Primero guarda el perfil profesional para poder subir credenciales.
    </AppBox>
    <template v-else>
      <div class="input_row">
        <q-input v-model="credTitle" label="Título de la credencial" outlined dense />
        <q-btn outline color="primary" :label="credFile?.name ? 'Cambiar imagen' : 'Seleccionar imagen'">
          <input type="file" hidden accept="image/*" @change="onCredFileChange" />
        </q-btn>
      </div>

      <div class="row items-center q-gutter-sm" style="margin-top: 10px">
        <q-btn size="sm" unelevated color="primary" label="Agregar credencial" :disable="credentials.length >= 3" @click="addCredential" />
        <span style="font-size: 12px">{{ credentials.length }}/3</span>
      </div>

      <div v-if="credentials.length > 0" style="margin-top: 12px; display: grid; gap: 10px">
        <div
          v-for="c in credentials"
          :key="c.credential_id"
          style="display: flex; gap: 12px; align-items: center; border: 1px solid #e6e6e6; border-radius: 10px; padding: 10px"
        >
          <div style="width: 64px; height: 64px; border-radius: 8px; overflow: hidden; background: #f5f5f5; flex: 0 0 64px">
            <img
              v-if="c.image"
              :src="c.image"
              :alt="c.title"
              style="width: 100%; height: 100%; object-fit: cover; cursor: zoom-in"
              @click="previewCredential = c"
            />
          </div>
          <div style="flex: 1">
            <div style="font-weight: 600">{{ c.title }}</div>
            <div style="font-size: 12px; opacity: 0.75">{{ c.created_at || '' }}</div>
          </div>
          <q-btn flat color="negative" label="Eliminar" @click="deleteCredential(c.credential_id)" />
        </div>
      </div>
    </template>

    <q-dialog :model-value="Boolean(previewCredential)" @update:model-value="(val: boolean) => !val && (previewCredential = null)">
      <q-card style="min-width: 400px">
        <q-card-section><div class="text-h6">{{ previewCredential?.title }}</div></q-card-section>
        <q-card-section v-if="previewCredential?.image">
          <img :src="previewCredential.image" :alt="previewCredential.title" style="width: 100%; height: auto" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
