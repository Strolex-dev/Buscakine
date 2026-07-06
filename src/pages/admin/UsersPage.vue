<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import EmptyElement from '@/components/shared/EmptyElement.vue'
import AlertDialog from '@/components/shared/AlertDialog.vue'
import AutocompleteField from '@/components/shared/AutocompleteField.vue'
import CredentialsManager from '@/components/shared/CredentialsManager.vue'

interface UserRow {
  user_id: number
  name: string
  last_name: string
  email: string
  image?: string
  user_type: string
  plan_id: number
  is_register_approved: string
}

const { data, execute } = useApiRequest<{ list: UserRow[] }>()

function loadList() {
  execute({ url: '/users/list', query: { full_list: 1 } })
}
onMounted(loadList)

const activeTab = ref<'patients' | 'nurses' | 'pending'>('patients')
const search = ref('')

const patients = computed(() => (data.value?.list ?? []).filter((u) => u.user_type === 'Paciente'))
const nurses = computed(() => (data.value?.list ?? []).filter((u) => u.user_type === 'Kinesiólogo'))
const pending = computed(() => nurses.value.filter((u) => Number(u.is_register_approved) === 0))

const tabList = computed(() => {
  if (activeTab.value === 'patients') return patients.value
  if (activeTab.value === 'nurses') return nurses.value
  return pending.value
})

const currentList = computed(() => {
  if (!search.value.trim()) return tabList.value
  const q = search.value.toLowerCase()
  return tabList.value.filter((u) => `${u.name} ${u.last_name}`.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
})

function switchTab(tab: typeof activeTab.value) {
  activeTab.value = tab
  search.value = ''
}

const availabilityOptions = ['Disponibilidad completa', 'Disponibilidad AM', 'Disponibilidad PM', 'Disponibilidad Fines de semana', 'Disponibilidad según turno (clínico/hospitalario)']
const insuranceOptions = ['Fonasa', 'Particular', 'Reembolsable con Isapre']

function defaultUser() {
  return {
    user_id: null as number | null,
    name: '', lastname: '', email: '', password: '', role_id: 2, phone: '', whatsapp: '',
    is_active: true, image: '', nurse_id: null as number | null,
    university_degree: '', service: '', price: '', region_id: '' as number | string,
    locations: [] as (number | string)[], skills: [] as (number | string)[],
    advanced_wound_care: false, online_advice: false, about_me: '',
    is_register_approved: 0, plan_id: '' as number | string, plan_expiry_date: '',
    contact_mode: 'standard', specialty_prices: {} as Record<string, string>,
    availability: [] as string[], superintendencia_registro: '', insurance_types: [] as string[],
    home_comuna_id: '' as number | string,
  }
}

const openEditor = ref(false)
const openAlert = ref(false)
const activeItem = ref<number | null>(null)
const loading = ref(false)
const formValues = reactive(defaultUser())
const isKinesiologo = computed(() => Number(formValues.role_id) !== 1)
const preferenteTerms = ref('')

function normalizeArray(value: unknown): (string | number)[] {
  return Array.isArray(value) ? value : []
}

async function loadPreferenteTerms() {
  const settings = await useApiRequest<{ seo: { preferente_terms?: string } }>().execute({ url: '/settings/details' })
  preferenteTerms.value = settings.seo?.preferente_terms ?? ''
}

function openNew() {
  activeItem.value = null
  Object.assign(formValues, defaultUser())
  openEditor.value = true
  loadPreferenteTerms()
}

async function openEdit(user_id: number) {
  activeItem.value = user_id
  const response = await useApiRequest<Record<string, unknown>>().execute({ url: '/users/details', query: { user_id } })
  Object.assign(formValues, defaultUser(), response, {
    availability: normalizeArray(response.availability),
    insurance_types: normalizeArray(response.insurance_types),
    locations: normalizeArray(response.locations),
    skills: normalizeArray(response.skills),
    specialty_prices: (response.specialty_prices as Record<string, string>) ?? {},
  })
  openEditor.value = true
  loadPreferenteTerms()
}

function openPublicProfile(user_id: number) {
  window.open(`/kinesiologos/${user_id}`, '_blank')
}

async function submit() {
  loading.value = true
  const body = new FormData()
  body.append('formValues', JSON.stringify(formValues))
  const response = await useApiRequest<{ status: string; message?: string }>().execute({ url: '/users/updateAccount', method: 'POST', formData: true, body })
  loading.value = false
  if (response.status === 'success') {
    Notify.create({ type: 'positive', message: 'Usuario guardado con éxito' })
    openEditor.value = false
    loadList()
  } else {
    Notify.create({ type: 'negative', message: response.message })
  }
}

function handleDelete(user_id: number) {
  activeItem.value = user_id
  openAlert.value = true
}
async function deleteItem() {
  const response = await useApiRequest<{ status: string }>().execute({ url: '/users/deleteItem', method: 'POST', body: { user_id: activeItem.value } })
  if (response.status === 'success') {
    Notify.create({ type: 'positive', message: 'Usuario eliminado con éxito' })
    loadList()
  }
  openAlert.value = false
}
</script>

<template>
  <q-page id="UsersList" class="content">
    <div class="ModuleWrapper">
      <div class="boxContainerHeader">
        <div class="boxContainerTitle">
          <h2 class="h2_title">Usuarios</h2>
          <span class="h2_subtitle">{{ patients.length + nurses.length }} usuarios registrados</span>
        </div>
        <q-btn unelevated color="primary" icon="add" label="Nuevo usuario" @click="openNew" />
      </div>

      <AppBox box-class="box100" style="padding: 0; overflow: hidden">
        <q-tabs v-model="activeTab" align="left" active-color="primary" indicator-color="primary" @update:model-value="() => (search = '')">
          <q-tab name="patients" :label="`Pacientes (${patients.length})`" @click="switchTab('patients')" />
          <q-tab name="nurses" :label="`Kinesiólogos (${nurses.length})`" @click="switchTab('nurses')" />
          <q-tab name="pending" :label="`Por Aprobar (${pending.length})`" :class="pending.length > 0 ? 'text-warning' : ''" @click="switchTab('pending')" />
        </q-tabs>
        <q-separator />

        <div style="padding: 12px 16px 4px">
          <q-input v-model="search" dense outlined placeholder="Buscar por nombre o email..." style="max-width: 320px">
            <template #prepend><q-icon name="search" size="18px" /></template>
          </q-input>
        </div>

        <div style="padding: 8px 0 16px">
          <template v-if="currentList.length">
            <q-table
              :rows="currentList"
              :columns="[
                { name: 'user', label: 'Usuario', field: 'name', align: 'left' },
                { name: 'status', label: 'Estado', field: 'is_register_approved', align: 'left' },
                { name: 'actions', label: '', field: 'user_id', align: 'right' },
              ]"
              row-key="user_id"
              flat
              hide-bottom
            >
              <template #body-cell-user="props">
                <q-td :props="props">
                  <div class="flex_row">
                    <q-avatar size="32px"><img v-if="props.row.image" :src="props.row.image" /></q-avatar>
                    <div class="flex_td">
                      <span class="flex_title name_title">
                        {{ props.row.name }} {{ props.row.last_name }}
                        <q-icon v-if="props.row.plan_id > 0" name="verified" size="15px" color="primary" />
                      </span>
                      <span class="flex_subtitle">{{ props.row.email }}</span>
                    </div>
                  </div>
                </q-td>
              </template>
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-chip v-if="activeTab !== 'patients' && props.row.is_register_approved == '0'" label="Por aprobar" color="warning" size="sm" />
                  <q-chip v-if="activeTab !== 'patients' && props.row.is_register_approved == '1'" label="Aprobado" color="positive" size="sm" />
                  <q-chip v-if="activeTab !== 'patients' && props.row.is_register_approved == '2'" label="Rechazado" color="negative" size="sm" />
                </q-td>
              </template>
              <template #body-cell-actions="props">
                <q-td :props="props" class="text-right">
                  <q-btn size="sm" unelevated color="primary" icon="edit" label="Editar" style="margin-right: 10px" @click="openEdit(props.row.user_id)" />
                  <q-btn
                    v-if="activeTab !== 'patients'"
                    size="sm"
                    flat
                    round
                    color="grey-7"
                    icon="open_in_new"
                    @click="openPublicProfile(props.row.user_id)"
                  >
                    <q-tooltip>Ver perfil público</q-tooltip>
                  </q-btn>
                  <q-btn size="sm" flat round color="negative" icon="delete_outline" @click="handleDelete(props.row.user_id)" />
                </q-td>
              </template>
            </q-table>
          </template>
          <EmptyElement v-else title="Sin usuarios" subtitle="No hay usuarios en esta categoría" />
        </div>
      </AppBox>
    </div>

    <q-dialog v-model="openEditor">
      <q-card style="min-width: 700px; max-width: 900px">
        <q-card-section>
          <div class="h2_title">Usuario</div>
          <span class="h2_subtitle">Editar</span>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <div class="input_group">
            <h2>Información Personal</h2>
            <div class="input_row">
              <q-input v-model="formValues.name" label="Nombres" outlined dense required />
              <q-input v-model="formValues.lastname" label="Apellidos" outlined dense required />
            </div>
            <div class="input_row">
              <q-input v-model="formValues.phone" label="Teléfono" outlined dense required />
              <q-input v-model="formValues.whatsapp" label="WhatsApp" outlined dense />
            </div>
          </div>

          <div class="input_group">
            <h2>Información de sesión</h2>
            <div class="input_row">
              <q-input v-model="formValues.email" label="Email" outlined dense required />
              <q-input v-model="formValues.password" label="Password" type="password" autocomplete="new-password" outlined dense />
            </div>
            <q-select
              v-model="formValues.role_id"
              :options="[{ label: 'Paciente', value: 1 }, { label: 'Kinesiólogo', value: 2 }, { label: 'Admin', value: 100 }]"
              label="Rol"
              emit-value
              map-options
              outlined
              dense
            />
          </div>

          <div v-if="isKinesiologo" class="input_group">
            <h2>Información de Kinesiólogo</h2>
            <div class="input_row">
              <q-input v-model="formValues.university_degree" label="Título Universitario" outlined dense />
              <q-input v-model="formValues.service" label="Servicio" outlined dense />
              <q-input v-model="formValues.price" label="Precio" outlined dense />
            </div>
            <AutocompleteField label="Región" endpoint="/locations/regiones/list" v-model="formValues.region_id" />
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

            <q-input v-model="formValues.superintendencia_registro" label="Número de Registro en la Superintendencia de Salud" outlined dense required />

            <q-select
              v-model="formValues.contact_mode"
              :options="[{ label: 'Derivación Preferente', value: 'preferente' }, { label: 'Contacto Estándar', value: 'standard' }]"
              label="Modalidad de contacto y derivación"
              emit-value
              map-options
              outlined
              dense
            />

            <div
              v-if="formValues.contact_mode === 'preferente' && preferenteTerms"
              style="padding: 14px 16px; background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; font-size: 13px; color: #78350f; line-height: 1.6"
            >
              <div style="font-weight: 600; margin-bottom: 6px; color: #92400e">Condiciones de la Derivación Preferente</div>
              <div v-html="preferenteTerms"></div>
            </div>

            <q-select v-model="formValues.availability" :options="availabilityOptions" label="Disponibilidad Interna" multiple outlined dense use-chips />
            <q-select v-model="formValues.insurance_types" :options="insuranceOptions" label="Atención / Pago" multiple outlined dense use-chips />

            <q-toggle v-model="formValues.advanced_wound_care" label="Kinesiología a Domicilio" color="primary" />
            <q-toggle v-model="formValues.online_advice" label="Kinesiología en Consulta" color="primary" />

            <q-input v-model="formValues.about_me" label="Sobre mí" type="textarea" outlined dense />

            <div class="input_group" style="border: 1px solid #e0e0e0; border-radius: 10px; padding: 16px; background: #fafafa">
              <h2 style="margin: 0 0 8px 0">Certificados y Especializaciones</h2>
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #666">Máximo 3 certificados.</p>
              <CredentialsManager :nurse-id="formValues.nurse_id" />
            </div>
          </div>

          <div class="input_group">
            <h2>Estado de Registro</h2>
            <q-select
              v-model="formValues.is_register_approved"
              :options="[{ label: 'Pendiente', value: 0 }, { label: 'Aprobado', value: 1 }, { label: 'Rechazado', value: 2 }]"
              label="Estado de Registro"
              emit-value
              map-options
              outlined
              dense
            />
            <q-toggle v-model="formValues.is_active" label="Perfil Activo" color="primary" />
          </div>

          <AutocompleteField label="Plan" endpoint="/plans/list" v-model="formValues.plan_id" />
          <q-input v-model="formValues.plan_expiry_date" label="Fecha de expiración" type="date" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" :disable="loading" @click="openEditor = false" />
          <q-btn unelevated color="primary" :loading="loading" label="Guardar" @click="submit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <AlertDialog v-model:open="openAlert" subtitle="¿Está seguro que desea eliminar este usuario?" @confirm="deleteItem" />
  </q-page>
</template>
