<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import AlertDialog from '@/components/shared/AlertDialog.vue'

interface Plan {
  plan_id: number
  plan_name: string
  price: number
  days: number
  status: string
  short_description: string
  description: string
}

const { data, execute } = useApiRequest<{ list: Plan[]; pagination: { total_pages: number } }>()
const page = ref(1)

function loadList() {
  execute({ url: '/plans/list', query: { page: page.value, role_id: 1 } })
}
onMounted(loadList)
watch(page, loadList)

const openEditor = ref(false)
const openAlert = ref(false)
const activeItem = ref<number | null>(null)
const formValues = reactive({ plan_id: null as number | null, plan_name: '', status: false, price: 0, days: 30, description: '', short_description: '' })

function openNew() {
  activeItem.value = null
  Object.assign(formValues, { plan_id: null, plan_name: '', status: false, price: 0, days: 30, description: '', short_description: '' })
  openEditor.value = true
}

async function openEdit(plan: Plan) {
  activeItem.value = plan.plan_id
  const response = await useApiRequest<Omit<Plan, 'status'> & { status: boolean | string }>().execute({ url: '/plans/details', query: { plan_id: plan.plan_id } })
  Object.assign(formValues, response, { status: response.status === true || response.status === 'Active' })
  openEditor.value = true
}

async function submit() {
  const response = await useApiRequest<{ status: string; message?: string }>().execute({ url: '/plans/addedit', method: 'POST', body: formValues })
  if (response.status === 'success') {
    Notify.create({ type: 'positive', message: 'Success' })
    openEditor.value = false
    loadList()
  } else {
    Notify.create({ type: 'negative', message: response.message })
  }
}

function handleDelete(plan_id: number) {
  activeItem.value = plan_id
  openAlert.value = true
}
async function deleteItem() {
  const response = await useApiRequest<{ status: string }>().execute({ url: '/plans/deleteItem', method: 'POST', body: { plan_id: activeItem.value } })
  if (response.status === 'success') {
    Notify.create({ type: 'positive', message: 'Plan eliminado' })
    loadList()
  }
  openAlert.value = false
}
</script>

<template>
  <q-page class="content">
    <div class="blog_title_row">
      <h2 class="titles">Planes</h2>
      <q-btn flat color="primary" icon="add" label="Agregar Plan" @click="openNew" />
    </div>

    <AppBox box-class="box100">
      <q-table
        v-if="data?.list?.length"
        :rows="data.list"
        :columns="[
          { name: 'plan_name', label: 'Nombre del Plan', field: 'plan_name', align: 'left' },
          { name: 'plan_id', label: 'ID', field: 'plan_id', align: 'left' },
          { name: 'price', label: 'Precio', field: 'price', align: 'left' },
          { name: 'days', label: 'Días', field: 'days', align: 'left' },
          { name: 'status', label: 'Estado', field: 'status', align: 'left' },
          { name: 'actions', label: 'Acciones', field: 'plan_id', align: 'right' },
        ]"
        row-key="plan_id"
        flat
        hide-bottom
      >
        <template #body-cell-price="props">
          <q-td :props="props">${{ props.row.price }}</q-td>
        </template>
        <template #body-cell-status="props">
          <q-td :props="props" :style="{ color: props.row.status === 'Active' ? '#0A7715' : '#CCCCCC' }">{{ props.row.status }}</q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn size="sm" flat round color="primary" icon="edit" @click="openEdit(props.row)" />
            <q-btn size="sm" flat round color="negative" icon="delete_outline" @click="handleDelete(props.row.plan_id)" />
          </q-td>
        </template>
      </q-table>
      <div v-else>Sin resultados</div>
    </AppBox>

    <q-pagination v-if="(data?.pagination?.total_pages ?? 0) > 1" v-model="page" :max="data?.pagination?.total_pages ?? 1" color="secondary" />

    <q-dialog v-model="openEditor">
      <q-card style="min-width: 500px">
        <q-card-section><div class="text-h6">{{ activeItem ? 'Editar' : 'Agregar' }} Plan</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="formValues.plan_name" label="Nombre del Plan" outlined dense required />
          <q-input v-model.number="formValues.price" label="Precio" type="number" outlined dense required />
          <q-input v-model.number="formValues.days" label="Días" type="number" outlined dense required />
          <q-input v-model="formValues.short_description" label="Descripción Corta" outlined dense required />
          <q-input v-model="formValues.description" label="Descripción" type="textarea" outlined dense required />
          <q-toggle v-model="formValues.status" label="Estado" color="purple" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="openEditor = false" />
          <q-btn unelevated color="secondary" label="Confirmar" @click="submit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <AlertDialog v-model:open="openAlert" subtitle="¿Estás seguro de que quieres eliminar este plan?" @confirm="deleteItem" />
  </q-page>
</template>
