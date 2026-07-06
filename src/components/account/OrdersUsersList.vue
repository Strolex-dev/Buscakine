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
  rating_id: number
  rating_value?: number
}

const { data, execute } = useApiRequest<{ list: Order[]; total_pages: number }>()
const page = ref(1)

function loadOrders() {
  execute({ url: '/orders/usersList', query: { page: page.value } })
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

const openComment = ref(false)
const comment = ref('')
const ratingValue = ref(0)
const orderId = ref(0)

function openRatingDialog(item: Order, value: number) {
  ratingValue.value = value
  orderId.value = item.order_id
  openComment.value = true
}

async function submitRating() {
  await useApiRequest().execute({
    url: '/orders/updateRating',
    method: 'POST',
    body: { order_id: orderId.value, rating_value: ratingValue.value, comment: comment.value },
  })
  openComment.value = false
  loadOrders()
}
</script>

<template>
  <div class="account_users_services">
    <h2 class="contract_title"><q-icon name="description" /> Contratos</h2>

    <div class="contract_user_container">
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

            <template v-if="item.rating_id == 0 && item.order_status === 'finished'">
              <h2>Califica</h2>
              <q-rating
                :model-value="item.rating_value || 0"
                size="1.4em"
                color="primary"
                icon="star_rate"
                @update:model-value="(val: number) => openRatingDialog(item, val)"
              />
            </template>
          </div>
        </AppBox>
      </template>
      <p v-else>No tienes servicios</p>
    </div>

    <q-pagination
      v-if="(data?.total_pages ?? 0) > 1"
      v-model="page"
      :max="data?.total_pages ?? 1"
      color="primary"
      style="margin-top: 20px; align-self: center"
    />

    <q-dialog v-model="openComment">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Calificar</div>
          <p>Deja tu comentario</p>
          <q-input v-model="comment" label="Comentario" type="textarea" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="openComment = false" />
          <q-btn unelevated color="primary" label="Calificar" @click="submitRating" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
