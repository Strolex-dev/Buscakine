<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { signInWithPopup } from 'firebase/auth'
import { Notify } from 'quasar'
import { auth, googleProvider } from '@/boot/firebase'
import { api } from '@/boot/axios'
import { useAuthStore } from '@/stores/auth'
import AppBox from '@/components/shared/AppBox.vue'
import logo from '@/assets/logo_alt.png'

const authStore = useAuthStore()
const loading = ref(false)
const showEmailForm = ref(false)

const roleOptions = [
  { label: 'Paciente', value: 1 },
  { label: 'Kinesiólogo', value: 2 },
]

const formValues = reactive({
  role_id: null as number | null,
  name: '',
  lastname: '',
  phone: '',
  email: '',
  password: '',
  confirm_password: '',
})

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase())
}

const emailInvalid = computed(() => formValues.email !== '' && !validateEmail(formValues.email))
const passwordMismatch = computed(
  () => formValues.confirm_password !== '' && formValues.password !== formValues.confirm_password,
)
const fieldsCompleted = computed(
  () =>
    formValues.role_id !== null &&
    formValues.name !== '' &&
    formValues.lastname !== '' &&
    formValues.phone !== '' &&
    validateEmail(formValues.email) &&
    formValues.password !== '' &&
    formValues.confirm_password !== '' &&
    formValues.password === formValues.confirm_password,
)

async function submit() {
  loading.value = true
  try {
    const { data } = await api.post('/users/signup', formValues)
    if (data.status === 'error') {
      Notify.create({ type: 'negative', message: data.message })
    } else {
      window.location.href = '/login'
    }
  } finally {
    loading.value = false
  }
}

async function signUpWithGoogle() {
  if (!formValues.role_id) {
    Notify.create({ type: 'warning', message: 'Selecciona primero si eres Paciente o Kinesiólogo' })
    return
  }
  loading.value = true
  try {
    const cred = await signInWithPopup(auth, googleProvider)
    const user = cred.user
    const nameParts = (user.displayName ?? '').split(' ')
    const { data } = await api.post('/users/google-signup', {
      email: user.email,
      name: nameParts[0] || '',
      lastname: nameParts.slice(1).join(' ') || '',
      google_id: user.uid,
      role_id: formValues.role_id,
    })
    if (data.status === 'error') {
      Notify.create({ type: 'negative', message: data.message })
    } else {
      authStore.login({ ltkn: data.user_info.ltkn, role_id: Number(data.user_info.role_id), email: user.email ?? '' })
      Notify.create({ type: 'positive', message: data.message })
      window.location.href = '/'
    }
  } catch {
    Notify.create({ type: 'negative', message: 'Error al registrarse con Google' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppBox box-class="intent-auth_component" id="loginBox">
    <img class="loginLogo" :src="logo" />

    <div class="input_group">
      <q-select
        v-model="formValues.role_id"
        :options="roleOptions"
        label="Selecciona un tipo de usuario"
        hint="¿Eres paciente o kinesiólogo?"
        emit-value
        map-options
        outlined
        dense
        required
      />

      <template v-if="formValues.role_id">
        <q-btn
          outline
          color="primary"
          icon="fa-brands fa-google"
          label="Registrarme con Google"
          :loading="loading"
          :disable="loading"
          style="width: 100%; margin-top: 10px"
          @click="signUpWithGoogle"
        />

        <q-btn
          outline
          color="primary"
          :label="showEmailForm ? 'Ocultar formulario de correo' : 'Registrarme con correo'"
          style="width: 100%; margin-top: 10px"
          @click="showEmailForm = !showEmailForm"
        />
      </template>

      <template v-if="formValues.role_id && showEmailForm">
        <div class="input_row">
          <q-input v-model="formValues.name" label="Nombre" outlined dense />
          <q-input v-model="formValues.lastname" label="Apellido" outlined dense />
        </div>

        <q-input v-model="formValues.phone" label="Número de Teléfono" outlined dense />

        <q-input
          v-model="formValues.email"
          label="Correo Electrónico"
          outlined
          dense
          :error="emailInvalid"
          error-message="Correo inválido"
        />

        <q-input v-model="formValues.password" label="Contraseña" type="password" outlined dense />

        <q-input
          v-model="formValues.confirm_password"
          label="Confirmar Contraseña"
          type="password"
          outlined
          dense
          :error="passwordMismatch"
          error-message="Las contraseñas no coinciden"
        />

        <q-btn
          :loading="loading"
          :disable="!fieldsCompleted || loading"
          unelevated
          color="primary"
          label="Registrarme"
          style="width: 100%"
          @click="submit"
        />
      </template>
    </div>
  </AppBox>
</template>
