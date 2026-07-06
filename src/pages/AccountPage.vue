<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import ImageUploader from '@/components/shared/ImageUploader.vue'
import OrdersList from '@/components/account/OrdersList.vue'
import OrdersUsersList from '@/components/account/OrdersUsersList.vue'

interface UserDetails {
  name: string
  lastname: string
  email: string
  phone: string
  image: string
  university_degree?: string
  region?: string
  service?: string
  price?: string
  about_me?: string
  advanced_wound_care?: boolean
  online_advice?: boolean
  locations_labels?: string[]
  skills_labels?: string[]
  average_rating?: number
  badge?: string
  contact_mode?: string
  whatsapp?: string
}

const auth = useAuthStore()
const { data, execute } = useApiRequest<UserDetails>()
const loadingButton = ref(false)
const file = ref<File | null>(null)

const formValues = reactive({ name: '', lastname: '', email: '', phone: '', image: '' })

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').toLowerCase())
}

onMounted(async () => {
  const response = await execute({ url: '/users/details' })
  if (auth.isPatient && response) {
    formValues.name = response.name ?? ''
    formValues.lastname = response.lastname ?? ''
    formValues.email = response.email ?? ''
    formValues.phone = response.phone ?? ''
    formValues.image = response.image ?? ''
  }
})

function openWhatsApp() {
  window.open(`https://wa.me/+56${data.value?.whatsapp}`, '_blank')
}

async function submit() {
  const body = new FormData()
  body.append('formValues', JSON.stringify(formValues))
  if (file.value) body.append('image', file.value)

  loadingButton.value = true
  await useApiRequest().execute({ url: '/users/updateAccount', method: 'POST', formData: true, body })
  loadingButton.value = false
}
</script>

<template>
  <q-page class="content">
    <!-- Patient: simple editable account form -->
    <div v-if="auth.isPatient" id="account_users_container">
      <AppBox box-class="intent-auth_component">
        <div class="section_flex">
          <ImageUploader
            uploader-class="user_image"
            :image="formValues.image"
            @update:image="(img: string) => (formValues.image = img)"
            @update:file="(f: File) => (file = f)"
          />
          <div class="account_right">
            <div class="input_group">
              <div class="input_row">
                <q-input v-model="formValues.name" label="Nombre" outlined dense />
                <q-input v-model="formValues.lastname" label="Apellido" outlined dense />
              </div>
              <div class="input_row">
                <q-input v-model="formValues.phone" label="Número de Teléfono" outlined dense />
                <q-input
                  v-model="formValues.email"
                  label="Correo Electrónico"
                  outlined
                  dense
                  :error="formValues.email !== '' && !validateEmail(formValues.email)"
                  error-message="Correo inválido"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="input_group">
          <q-btn :loading="loadingButton" unelevated color="primary" label="Guardar" style="width: 100%" @click="submit" />
        </div>
      </AppBox>

      <OrdersUsersList />
    </div>

    <!-- Kinesiólogo: read-only profile with edit link -->
    <div v-else-if="auth.isKinesiologo && data" class="account_flex">
      <div class="account_left">
        <AppBox>
          <div class="section_flex">
            <div class="user_image">
              <img v-if="data.image" :src="data.image" alt="Imagen de perfil" style="width: 150px; height: 150px" />
              <q-skeleton v-else type="rect" width="200px" height="200px" />
            </div>

            <div class="account_right">
              <div class="info_column">
                <h1 class="user_name">{{ data.name }} {{ data.lastname }}</h1>
                <div v-if="data.contact_mode === 'preferente'" class="items_row">
                  <q-chip v-if="data.badge" :label="data.badge" />
                </div>
                <span class="user_subtitle">{{ data.university_degree }}</span>
                <span class="user_subtitle">{{ data.region }}</span>
                <q-rating :model-value="Number(data.average_rating) || 0" readonly size="1.2em" color="primary" icon="star_rate" />
                <h3 class="service_title">Servicio Ofrecido</h3>
                <div class="service_row">
                  <span class="service_label">{{ data.service }}</span>
                  <span class="service_price">{{ data.price }}</span>
                </div>
              </div>
            </div>

            <div>
              <q-btn unelevated color="primary" icon="edit" label="Editar" to="/cuenta/editar" />
            </div>
          </div>

          <div>
            <h2 class="titles"><q-icon name="medical_services" size="25px" /> Acerca de mi</h2>
            <p>{{ data.about_me }}</p>
          </div>

          <div>
            <h2 class="titles">Prestaciones</h2>
            <div class="services_row">
              <span v-if="data.advanced_wound_care" class="item_icon"><q-icon name="healing" /> Kinesiología a Domicilio</span>
              <span v-if="data.online_advice" class="item_icon"><q-icon name="desktop_windows" /> Asesoria Online</span>
            </div>
          </div>

          <div>
            <h2 class="titles">Comunas</h2>
            <div class="items_row">
              <q-chip v-for="(location, index) in data.locations_labels" :key="index" :label="location" />
            </div>
          </div>

          <div>
            <h2 class="titles">Habilidades</h2>
            <div class="items_row">
              <q-chip v-for="(skill, index) in data.skills_labels" :key="index" :label="skill" />
            </div>
          </div>

          <div>
            <h2 class="titles">WhatsApp</h2>
            <div class="items_row">
              <q-btn
                v-if="data.contact_mode === 'preferente' && data.whatsapp"
                unelevated
                color="positive"
                icon="fa-brands fa-whatsapp"
                label="WhatsApp"
                @click="openWhatsApp"
              />
              <span v-else>Disponible solo para modalidad Derivación Preferente. En Contacto Estándar se usa mensajería interna.</span>
            </div>
          </div>
        </AppBox>
      </div>

      <OrdersList />
    </div>
  </q-page>
</template>
