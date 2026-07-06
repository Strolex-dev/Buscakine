<script setup lang="ts">
import { ref, watch } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'

const props = defineProps<{ nurseId: string | number | undefined }>()

interface Credential {
  credential_id: number
  title: string
  image?: string
  image_url?: string
}

const { data, loading, execute } = useApiRequest<{ status: string; items?: Credential[]; data?: Credential[] }>()
const preview = ref<Credential | null>(null)

watch(
  () => props.nurseId,
  (nurseId) => {
    if (!nurseId) return
    execute({ url: '/kinesiologists/credentials', query: { nurse_id: nurseId } })
  },
  { immediate: true },
)
</script>

<template>
  <AppBox v-if="loading" box-class="intent-box">Cargando credenciales…</AppBox>
  <template v-else-if="data?.status === 'success' && (data.items ?? data.data ?? []).length > 0">
    <AppBox box-class="intent-box">
      <h3>Credenciales y Especializaciones</h3>
      <div class="credentials_grid">
        <div v-for="item in data.items ?? data.data" :key="item.credential_id" class="credential_card">
          <img
            class="credential_img"
            :src="item.image || item.image_url"
            :alt="item.title"
            loading="lazy"
            style="cursor: zoom-in"
            @click="preview = item"
          />
          <div class="credential_title">{{ item.title }}</div>
        </div>
      </div>
    </AppBox>

    <q-dialog :model-value="Boolean(preview)" @update:model-value="(val: boolean) => !val && (preview = null)">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ preview?.title }}</div>
        </q-card-section>
        <q-card-section v-if="preview?.image || preview?.image_url">
          <img :src="preview?.image || preview?.image_url" :alt="preview?.title" style="width: 100%; height: auto" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </template>
</template>
