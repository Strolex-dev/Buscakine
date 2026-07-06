<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import AlertDialog from '@/components/shared/AlertDialog.vue'

interface Badge {
  badge_id: number
  badge: string
}

const { data, execute } = useApiRequest<{ list: Badge[]; total_pages: number }>()
const page = ref(1)

function loadList() {
  execute({ url: '/badges/list', query: { page: page.value } })
}
onMounted(loadList)
watch(page, loadList)

const openEditor = ref(false)
const openAlert = ref(false)
const activeItem = ref<number | null>(null)
const loading = ref(false)
const formValues = reactive({ badge_id: null as number | null, badge: '' })

function openNew() {
  activeItem.value = null
  Object.assign(formValues, { badge_id: null, badge: '' })
  openEditor.value = true
}

async function openEdit(badge: Badge) {
  activeItem.value = badge.badge_id
  const response = await useApiRequest<{ data: Badge }>().execute({ url: '/badges/details', query: { badge_id: badge.badge_id } })
  Object.assign(formValues, response.data)
  openEditor.value = true
}

async function submit() {
  if (!formValues.badge) return
  loading.value = true
  const response = await useApiRequest<{ status: string; message: string }>().execute({
    url: '/badges/create',
    method: 'POST',
    body: formValues,
  })
  loading.value = false
  if (response.status === 'success') {
    Notify.create({ type: 'positive', message: activeItem.value ? 'Distintivo actualizado correctamente' : 'Distintivo creado correctamente' })
    openEditor.value = false
    loadList()
  } else {
    Notify.create({ type: 'negative', message: response.message })
  }
}

function handleDelete(badge_id: number) {
  activeItem.value = badge_id
  openAlert.value = true
}

async function deleteItem() {
  const response = await useApiRequest<{ status: string }>().execute({
    url: '/badges/deleteItem',
    method: 'POST',
    body: { badge_id: activeItem.value },
  })
  if (response.status === 'success') {
    Notify.create({ type: 'positive', message: 'Distintivo eliminado con éxito' })
    loadList()
  }
  openAlert.value = false
}
</script>

<template>
  <q-page class="content">
    <div class="blog_title_row">
      <h2 class="titles">Distintivos</h2>
      <q-btn unelevated color="primary" icon="add" label="Nuevo distintivo" @click="openNew" />
    </div>

    <AppBox box-class="blog_entries">
      <q-table
        :rows="data?.list ?? []"
        :columns="[
          { name: 'badge', label: 'Distintivo', field: 'badge', align: 'left' },
          { name: 'actions', label: 'Acciones', field: 'badge_id', align: 'right' },
        ]"
        row-key="badge_id"
        flat
        hide-bottom
      >
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn size="sm" unelevated color="primary" icon="edit" label="Editar" style="margin-right: 10px" @click="openEdit(props.row)" />
            <q-btn size="sm" flat round color="negative" icon="delete_outline" @click="handleDelete(props.row.badge_id)" />
          </q-td>
        </template>
      </q-table>
    </AppBox>

    <div v-if="(data?.total_pages ?? 0) > 1" class="pagination_container">
      <q-pagination v-model="page" :max="data?.total_pages ?? 1" color="primary" style="margin-top: 20px" />
    </div>

    <q-dialog v-model="openEditor">
      <q-card style="min-width: 400px">
        <q-card-section><div class="text-h6">{{ activeItem ? 'Editar' : 'Añadir' }} distintivo</div></q-card-section>
        <q-card-section>
          <q-input v-model="formValues.badge" label="Distintivo" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="openEditor = false" />
          <q-btn unelevated color="primary" :disable="!formValues.badge || loading" :label="activeItem ? 'Actualizar distintivo' : 'Crear distintivo'" @click="submit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <AlertDialog v-model:open="openAlert" subtitle="¿Está seguro que desea eliminar este distintivo?" @confirm="deleteItem" />
  </q-page>
</template>
