<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { toFilterArray, useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import EmptyElement from '@/components/shared/EmptyElement.vue'

interface Order {
  service: string
  order_date: string
  address: string
  comuna_name: string
  nurse_name: string
  buyer_name: string
  order_status: string
  phone: string
  comments: string
}

const { data, execute } = useApiRequest<{ list: Order[]; total_pages: number }>()
const page = ref(1)
const filters = reactive({ 'nurse.name': '', 'nurse.email': '' })

function loadOrders() {
  execute({ url: '/orders/list', query: { page: page.value, filters: toFilterArray(filters) } })
}
onMounted(loadOrders)
watch(page, loadOrders)
watch(filters, () => { page.value = 1; loadOrders() })

function statusLabel(status: string) {
  switch (status) {
    case 'pending': return { label: 'Pendiente', color: 'grey' }
    case 'approved': return { label: 'Aprobado', color: 'primary' }
    case 'rejected': return { label: 'Rechazado', color: 'negative' }
    default: return { label: 'Finalizado', color: 'positive' }
  }
}
function serviceLabel(service: string) {
  return service === 'advanced_wound_care' ? 'Kinesiología a Domicilio' : 'Kinesiología en Consulta'
}
</script>

<template>
  <q-page id="OrdersList" class="content">
    <div class="ModuleWrapper">
      <div class="boxContainerHeader">
        <div class="boxContainerTitle">
          <h2 class="h2_title">Contratos</h2>
          <span class="h2_subtitle">{{ data?.list?.length ?? 0 }} contratos registrados</span>
        </div>
      </div>

      <div class="input_row q-mb-md">
        <q-input v-model="filters['nurse.name']" label="Nombre de Kinesiólogo" outlined dense />
        <q-input v-model="filters['nurse.email']" label="Email de Kinesiólogo" outlined dense />
      </div>

      <AppBox box-class="box100">
        <template v-if="data?.list?.length">
          <q-table
            :rows="data.list"
            :columns="[
              { name: 'service', label: 'Servicio y Fecha', field: 'service', align: 'left' },
              { name: 'address', label: 'Dirección', field: 'address', align: 'left' },
              { name: 'nurse_name', label: 'Kinesiólogo', field: 'nurse_name', align: 'left' },
              { name: 'buyer_name', label: 'Paciente', field: 'buyer_name', align: 'left' },
              { name: 'order_status', label: 'Estado', field: 'order_status', align: 'left' },
              { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' },
              { name: 'comments', label: 'Comentarios', field: 'comments', align: 'left' },
            ]"
            row-key="order_date"
            flat
            hide-bottom
          >
            <template #body-cell-service="props">
              <q-td :props="props">
                <div class="flex_td">
                  <span class="flex_title">{{ serviceLabel(props.row.service) }}</span>
                  <span class="flex_subtitle">{{ props.row.order_date }}</span>
                </div>
              </q-td>
            </template>
            <template #body-cell-address="props">
              <q-td :props="props">
                <div class="flex_td">
                  <span class="flex_title">{{ props.row.address }}</span>
                  <span class="flex_subtitle">{{ props.row.comuna_name }}</span>
                </div>
              </q-td>
            </template>
            <template #body-cell-order_status="props">
              <q-td :props="props">
                <q-chip class="chipStatus" :label="statusLabel(props.row.order_status).label" :color="statusLabel(props.row.order_status).color" outline size="sm" />
              </q-td>
            </template>
          </q-table>
        </template>
        <EmptyElement v-else title="No tienes servicios" subtitle="Empieza creando un nuevo contrato" />

        <q-pagination v-if="(data?.total_pages ?? 0) > 1" v-model="page" :max="data?.total_pages ?? 1" color="primary" style="margin-top: 20px" />
      </AppBox>
    </div>
  </q-page>
</template>
