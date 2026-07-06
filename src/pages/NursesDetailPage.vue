<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import AutocompleteField from '@/components/shared/AutocompleteField.vue'
import NurseRatings from '@/components/nurses/NurseRatings.vue'
import CredentialsGallery from '@/components/nurses/CredentialsGallery.vue'

interface NurseDetails {
  user_id: number
  nurse_id?: number
  name: string
  lastname: string
  image?: string
  image_position_x?: number
  image_position_y?: number
  badge?: string
  university_degree?: string
  region?: string
  home_comuna_label?: string
  average_rating?: number
  service?: string
  price?: string
  about_me?: string
  advanced_wound_care?: boolean
  online_advice?: boolean
  locations_labels?: string[]
  skills_labels?: string[]
  whatsapp?: string
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const userId = route.params.user_id as string

const { data, execute: loadDetails } = useApiRequest<NurseDetails>()
const loadingButton = ref(false)

const openLoginAlert = ref(false)
const openWhatsappForm = ref(false)
const openRatingForm = ref(false)
const ratingValue = ref(5)
const ratingComment = ref('')

const whatsappForm = reactive({
  name: '',
  phone: '',
  comuna: '',
  request: 'Necesito ayuda profesional',
})

onMounted(() => {
  loadDetails({ url: '/kinesiologists/details', query: { user_id: userId } })
})

async function handleStartConversationWhatsapp() {
  const body = new FormData()
  body.append(
    'formValues',
    JSON.stringify({ message_text: whatsappForm.request, image: '', conversation_id: '227' }),
  )
  await useApiRequest().execute({ url: '/messages/send', method: 'POST', formData: true, body })
}

function handleWhatsappSubmit() {
  const nurseName = `${data.value?.name ?? ''} ${data.value?.lastname ?? ''}`.trim()
  const message = `Hola, soy ${whatsappForm.name}.
    Teléfono: ${whatsappForm.phone}
    Comuna: ${whatsappForm.comuna}
    Solicitud: ${whatsappForm.request}

    Dirigido a: Kinesiólogo ${nurseName}`

  const whatsappURL = `https://wa.me/+56${data.value?.whatsapp}?text=${encodeURIComponent(message)}`
  handleStartConversationWhatsapp()
  window.open(whatsappURL, '_blank')
  openWhatsappForm.value = false
}

async function handleStartConversation() {
  if (!auth.isLoggedIn) {
    openLoginAlert.value = true
    return
  }
  loadingButton.value = true
  const response = await useApiRequest<{ conversation_id: string }>().execute({
    url: '/messages/create',
    method: 'POST',
    body: { recipient_id: data.value?.user_id },
  })
  loadingButton.value = false
  router.push(`/mensajes/${response.conversation_id}`)
}

function handleOpenRatingForm() {
  if (!auth.isLoggedIn) {
    openLoginAlert.value = true
    return
  }
  openRatingForm.value = true
}

async function handleRatingSubmit() {
  if (!ratingValue.value) return
  loadingButton.value = true
  const response = await useApiRequest<{ status: string }>().execute({
    url: '/ratings/create',
    method: 'POST',
    body: { rated_user_id: data.value?.user_id, rating_value: ratingValue.value, comment: ratingComment.value },
  })
  loadingButton.value = false
  if (response.status === 'success') {
    openRatingForm.value = false
    ratingComment.value = ''
    loadDetails({ url: '/kinesiologists/details', query: { user_id: userId } })
  }
}
</script>

<template>
  <q-page id="kinesiologists_details_container" class="content" v-if="data">
    <div class="kinesiologists_buttons">
      <q-btn v-if="data.whatsapp" color="positive" unelevated icon="fa-brands fa-whatsapp" label="WhatsApp" @click="openWhatsappForm = true" />
      <q-btn v-else unelevated color="primary" :disable="loadingButton" label="Mensaje interno" @click="handleStartConversation" />
      <q-btn unelevated color="primary" label="Evaluar" @click="handleOpenRatingForm" />
    </div>

    <AppBox>
      <div class="section_flex">
        <div class="user_image">
          <img
            v-if="data.image"
            :src="data.image"
            alt="Imagen de perfil"
            :style="{ width: '150px', height: '150px', objectFit: 'cover', objectPosition: `${data.image_position_x || 50}% ${data.image_position_y || 50}%` }"
          />
          <q-skeleton v-else type="rect" width="200px" height="200px" />
        </div>

        <div class="account_right">
          <div class="info_column">
            <h1 class="user_name">{{ data.name }} {{ data.lastname }}</h1>
            <div class="items_row">
              <q-chip
                v-if="data.badge"
                :label="data.badge"
                size="sm"
                icon="star"
                style="background: linear-gradient(45deg, #FFD700 30%, #DAA520 90%); color: #6B4423"
              />
            </div>
            <span class="user_subtitle">{{ data.university_degree }}</span>
            <span class="user_subtitle">{{ data.region }}</span>

            <q-rating :model-value="data.average_rating || 0" readonly size="1.2em" color="primary" icon="star_rate" />

            <span v-if="data.home_comuna_label" class="user_subtitle">Vive en: {{ data.home_comuna_label }}</span>
            <h3 class="service_title">Servicio Ofrecido</h3>
            <div class="service_row">
              <span class="service_label">{{ data.service }}</span>
              <span class="service_price">{{ data.price }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="account_flex">
        <div class="account_left">
          <div>
            <h2 class="titles"><q-icon name="medical_services" size="25px" /> Acerca de mi</h2>
            <p>{{ data.about_me }}</p>
          </div>

          <div>
            <h2 class="titles">Prestaciones</h2>
            <div class="services_row">
              <span v-if="data.advanced_wound_care" class="item_icon"><q-icon name="healing" /> Kinesiología a Domicilio</span>
              <span v-if="data.online_advice" class="item_icon"><q-icon name="desktop_windows" /> Asesoría Online</span>
            </div>
          </div>

          <div>
            <h2 class="titles">Comunas</h2>
            <div class="items_row">
              <q-chip v-for="(location, index) in data.locations_labels" :key="index" :label="location" />
            </div>
          </div>

          <div>
            <h2 class="titles">Especialidades</h2>
            <div class="items_row">
              <q-chip v-for="(skill, index) in data.skills_labels" :key="index" :label="skill" />
            </div>
          </div>
        </div>

        <NurseRatings :user-id="userId" />
      </div>
    </AppBox>

    <CredentialsGallery :nurse-id="data.nurse_id" />

    <q-dialog v-model="openWhatsappForm">
      <q-card style="min-width: 400px">
        <q-card-section><div class="text-h6">Contacto por WhatsApp</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="whatsappForm.name" label="Nombre" outlined dense />
          <q-input v-model="whatsappForm.phone" label="Teléfono" outlined dense />
          <AutocompleteField
            label="Comunas"
            endpoint="/locations/comunas/list"
            :render-values="['label', 'region']"
            :model-value="null"
            @option-select="(opt) => (whatsappForm.comuna = opt ? String(opt.label) : '')"
          />
          <q-input v-model="whatsappForm.request" label="Solicitud" type="textarea" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="openWhatsappForm = false" />
          <q-btn unelevated color="primary" label="Enviar" @click="handleWhatsappSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="openRatingForm">
      <q-card style="min-width: 400px">
        <q-card-section><div class="text-h6">Evaluar profesional</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <p>Comparte tu experiencia para ayudar a otros pacientes.</p>
          <q-rating v-model="ratingValue" size="2em" color="primary" icon="star_rate" />
          <q-input v-model="ratingComment" label="Comentario" type="textarea" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="openRatingForm = false" />
          <q-btn unelevated color="primary" :disable="loadingButton || !ratingValue" label="Guardar evaluación" @click="handleRatingSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="openLoginAlert">
      <q-card>
        <q-card-section><div class="text-h6">Atención</div></q-card-section>
        <q-card-section>Es necesario logearse para enviar mensajes a las kinesiólogas directamente.</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" @click="openLoginAlert = false" />
          <q-btn unelevated color="primary" label="Ir a Login" @click="() => { openLoginAlert = false; router.push('/login') }" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
