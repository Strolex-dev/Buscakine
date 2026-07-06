<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'

interface Order {
  order_id: number
  service: string
  comuna_name: string
  order_date: string
  buyer_name: string
  order_status: string
  address: string
  phone: string
  comments: string
}

const { data, execute } = useApiRequest<{ list: Order[]; total_pages: number }>()
const page = ref(1)
const loading = ref(false)

function loadOrders() {
  execute({ url: '/orders/list', query: { page: page.value } })
}

onMounted(loadOrders)
watch(page, loadOrders)

function statusLabel(status: string) {
  switch (status) {
    case 'pending':
      return { label: 'Pendiente', color: 'grey' }
    case 'approved':
      return { label: 'Aprobado', color: 'primary' }
    case 'rejected':
      return { label: 'Rechazado', color: 'negative' }
    default:
      return { label: 'Finalizado', color: 'positive' }
  }
}

function serviceLabel(service: string) {
  return service === 'advanced_wound_care' ? 'Kinesiología a Domicilio' : 'Kinesiología en Consulta'
}

async function changeStatus(order_id: number, order_status: string) {
  loading.value = true
  const response = await useApiRequest<{ status: string }>().execute({
    url: '/orders/changeOrderStatus',
    method: 'POST',
    body: { order_id, order_status },
  })
  loading.value = false
  if (response.status === 'success') loadOrders()
}
</script>

<template>
  <div class="account_services">
    <h2 class="contract_title"><q-icon name="description" /> Contratos</h2>

    <template v-if="data?.list?.length">
      <AppBox v-for="item in data.list" :key="item.order_id" box-class="contract_item">
        <div class="contract_header">
          <h2 class="contract_service">{{ serviceLabel(item.service) }}</h2>
          <div class="contract_row">
            <span class="contract_comuna">{{ item.comuna_name }}</span>
            <span class="contract_date">{{ item.order_date }}</span>
          </div>
        </div>
        <q-separator />
        <div class="contract_body">
          <h2 class="contract_service">Por: {{ item.buyer_name }}</h2>
          <q-chip class="chipStatus" :label="statusLabel(item.order_status).label" :color="statusLabel(item.order_status).color" outline size="sm" />
          <span class="contract_data"><b>Dir:</b> {{ item.address }}</span>
          <span class="contract_data"><b>Tel:</b> {{ item.phone }}</span>
          <span class="contract_data"><b>Comentarios:</b> {{ item.comments }}</span>
          <div class="contract_actions">
            <template v-if="item.order_status === 'pending'">
              <q-btn size="sm" unelevated color="primary" label="Aprobar" :disable="loading" style="margin-right: 10px" @click="changeStatus(item.order_id, 'approved')" />
              <q-btn size="sm" unelevated color="negative" label="Rechazar" :disable="loading" @click="changeStatus(item.order_id, 'rejected')" />
            </template>
            <q-btn v-else-if="item.order_status === 'approved'" size="sm" unelevated color="primary" label="Finalizar" :disable="loading" @click="changeStatus(item.order_id, 'finished')" />
          </div>
        </div>
      </AppBox>
    </template>
    <p v-else>No tienes servicios</p>

    <q-pagination
      v-if="(data?.total_pages ?? 0) > 1"
      v-model="page"
      :max="data?.total_pages ?? 1"
      color="primary"
      style="margin-top: 20px; align-self: center"
    />
  </div>
</template>
