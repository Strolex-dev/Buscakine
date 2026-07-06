<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import AutocompleteField from '@/components/shared/AutocompleteField.vue'
import ImageUploader from '@/components/shared/ImageUploader.vue'
import CredentialsManager from '@/components/shared/CredentialsManager.vue'

const availabilityOptions = [
  'Disponibilidad completa',
  'Disponibilidad AM',
  'Disponibilidad PM',
  'Disponibilidad Fines de semana',
  'Disponibilidad según turno (clínico/hospitalario)',
]
const insuranceOptions = ['Fonasa', 'Particular', 'Reembolsable con Isapre']

interface FormValues {
  name: string
  lastname: string
  email: string
  phone: string
  image: string
  nurse_id: number | null
  university_degree: string
  service: string
  price: string
  region_id: number | string | null
  locations: (number | string)[]
  skills: (number | string)[]
  advanced_wound_care: boolean
  online_advice: boolean
  about_me: string
  whatsapp: string
  badge_id: number | string | null
  contact_mode: string
  specialty_prices: Record<string, string>
  availability: string[]
  superintendencia_registro: string
  insurance_types: string[]
  home_comuna_id: number | string | null
  is_active: boolean
}

const formValues = reactive<FormValues>({
  name: '',
  lastname: '',
  email: '',
  phone: '',
  image: '',
  nurse_id: null,
  university_degree: '',
  service: '',
  price: '',
  region_id: null,
  locations: [],
  skills: [],
  advanced_wound_care: false,
  online_advice: false,
  about_me: '',
  whatsapp: '',
  badge_id: null,
  contact_mode: 'standard',
  specialty_prices: {},
  availability: [],
  superintendencia_registro: '',
  insurance_types: [],
  home_comuna_id: null,
  is_active: false,
})

const loadingButton = ref(false)
const emailError = ref(false)
const whatsappError = ref(false)
const file = ref<File | null>(null)
const preferenteTerms = ref('')

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email ?? '').toLowerCase())
}
function validateWhatsApp(whatsapp: string) {
  return /^\d{9}$/.test(String(whatsapp ?? ''))
}

onMounted(async () => {
  const response = await useApiRequest<FormValues>().execute({ url: '/users/details' })
  Object.assign(formValues, response)

  const settings = await useApiRequest<{ seo: { preferente_terms?: string } }>().execute({ url: '/settings/details' })
  preferenteTerms.value = settings.seo?.preferente_terms ?? ''
})

async function submit() {
  const isEmailValid = !formValues.email || validateEmail(formValues.email)
  const isWhatsappValid = !formValues.whatsapp || validateWhatsApp(formValues.whatsapp)
  emailError.value = !isEmailValid
  whatsappError.value = !isWhatsappValid
  if (!isEmailValid || !isWhatsappValid) return

  if (!formValues.superintendencia_registro) {
    Notify.create({ type: 'warning', message: 'El Registro de la Superintendencia de Salud es obligatorio' })
    return
  }

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
              <q-input v-model="formValues.university_degree" label="Título Universitario" outlined dense />
              <q-input v-model="formValues.service" label="Servicio" outlined dense />
              <q-input v-model="formValues.price" label="Precio" outlined dense />
            </div>

            <AutocompleteField label="Region" endpoint="/locations/regiones/list" v-model="formValues.region_id" />

            <AutocompleteField
              v-if="formValues.contact_mode === 'preferente'"
              label="Distintivo"
              endpoint="/badges/list"
              v-model="formValues.badge_id"
            />
          </div>
        </div>
      </div>

      <div class="input_group">
        <div class="input_row">
          <q-input v-model="formValues.phone" label="Número de Teléfono" outlined dense />
          <q-input
            v-model="formValues.email"
            label="Correo Electrónico"
            outlined
            dense
            :error="emailError"
            error-message="Correo inválido"
            @update:model-value="(v) => (emailError = !validateEmail(String(v)) && v !== '')"
          />
          <q-input
            v-if="formValues.contact_mode === 'preferente'"
            v-model="formValues.whatsapp"
            label="WhatsApp"
            outlined
            dense
            :error="whatsappError"
            error-message="WhatsApp inválido"
            @update:model-value="(v) => (whatsappError = !validateWhatsApp(String(v)) && v !== '')"
          />
        </div>

        <AutocompleteField
          v-if="formValues.region_id"
          label="Comunas"
          endpoint="/locations/comunas/list"
          :endpoint-params="{ region_id: formValues.region_id }"
          multiple
          v-model="formValues.locations"
        />

        <AutocompleteField label="Especialidades" endpoint="/skills/list" multiple v-model="formValues.skills" />

        <div v-if="formValues.skills.length > 0" class="input_group">
          <h3>Tarifas por especialidad</h3>
          <q-input
            v-for="skill in formValues.skills"
            :key="String(skill)"
            v-model="formValues.specialty_prices[String(skill)]"
            :label="`Valor CLP - Especialidad ${skill}`"
            type="number"
            outlined
            dense
          />
        </div>

        <AutocompleteField
          label="Comuna donde vive el profesional"
          endpoint="/locations/comunas/list"
          :render-values="['label', 'region']"
          v-model="formValues.home_comuna_id"
        />

        <q-input
          v-model="formValues.superintendencia_registro"
          label="Número de Registro en la Superintendencia de Salud"
          outlined
          dense
          required
        />

        <AppBox>
          <h3>Modalidad de contacto y derivación</h3>
          <q-option-group
            v-model="formValues.contact_mode"
            :options="[
              { label: 'Derivación Preferente: acepto gestión activa y cobro por derivación exitosa según Términos y Condiciones.', value: 'preferente' },
              { label: 'Contacto Estándar: solo mensajería interna o correo de la plataforma.', value: 'standard' },
            ]"
          />
          <p style="margin: 0 0 10px 32px; font-size: 13px; color: #555">
            <b>Costo de derivación: $5.000</b> (pago único por paciente). Este cobro se realiza solo una vez que la
            atención ha sido agendada, realizada y pagada por el paciente.
          </p>

          <div
            v-if="formValues.contact_mode === 'preferente' && preferenteTerms"
            style="margin: 10px 0 0 32px; padding: 14px 16px; background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; font-size: 13px; color: #78350f; line-height: 1.6"
          >
            <div style="font-weight: 600; margin-bottom: 6px; color: #92400e">Condiciones de la Derivación Preferente</div>
            <div v-html="preferenteTerms"></div>
          </div>
        </AppBox>

        <AppBox>
          <h3>Disponibilidad interna</h3>
          <q-checkbox
            v-for="option in availabilityOptions"
            :key="option"
            :model-value="formValues.availability.includes(option)"
            :label="option"
            @update:model-value="(checked: boolean) => {
              formValues.availability = checked
                ? [...formValues.availability, option]
                : formValues.availability.filter((x) => x !== option)
            }"
          />
        </AppBox>

        <AppBox>
          <h3>Tipo de atención / pago</h3>
          <div class="row">
            <q-checkbox
              v-for="option in insuranceOptions"
              :key="option"
              :model-value="formValues.insurance_types.includes(option)"
              :label="option"
              @update:model-value="(checked: boolean) => {
                formValues.insurance_types = checked
                  ? [...formValues.insurance_types, option]
                  : formValues.insurance_types.filter((x) => x !== option)
              }"
            />
          </div>
        </AppBox>

        <q-toggle v-model="formValues.advanced_wound_care" label="Kinesiología a Domicilio" color="primary" />
        <q-toggle v-model="formValues.online_advice" label="Kinesiología en Consulta" color="primary" />

        <q-input v-model="formValues.about_me" label="Sobre mí" outlined dense type="textarea" />

        <q-toggle v-model="formValues.is_active" label="Perfil activo" color="primary" />

        <AppBox box-class="intent-box" style="margin-top: 16px">
          <h3 style="margin: 0 0 6px 0">Credenciales y Especializaciones</h3>
          <p style="margin: 0 0 12px 0; font-size: 13px">
            Sube hasta <b>3</b> certificados (Diplomados, Cursos o Magíster). Cada credencial incluye un título y una imagen.
          </p>

          <CredentialsManager :nurse-id="formValues.nurse_id" />
        </AppBox>

        <q-btn :loading="loadingButton" unelevated color="primary" label="Guardar" style="width: 100%" @click="submit" />
      </div>
    </AppBox>
  </q-page>
</template>
