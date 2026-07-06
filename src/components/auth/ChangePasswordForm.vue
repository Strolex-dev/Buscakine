<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'
import AppBox from '@/components/shared/AppBox.vue'
import logo from '@/assets/logo_alt.png'

const props = defineProps<{ email: string; code: string }>()
const emit = defineEmits<{ 'go-login': [] }>()

const form = reactive({ password: '', confirmPassword: '' })
const loading = ref(false)
const mismatch = computed(() => form.confirmPassword !== '' && form.password !== form.confirmPassword)

async function submit() {
  if (form.password !== form.confirmPassword) {
    Notify.create({ type: 'negative', message: 'Passwords do not match' })
    return
  }
  loading.value = true
  try {
    const { data } = await api.get('/users/change_password', {
      params: { email: props.email, code: props.code, password: form.password },
    })
    if (data.status === 'success') {
      Notify.create({ type: 'positive', message: data.message })
      emit('go-login')
    } else {
      Notify.create({ type: 'negative', message: data.message })
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppBox box-class="intent-auth_component" id="loginBox">
    <img class="loginLogo" :src="logo" />

    <div class="form">
      <q-input v-model="form.password" label="Password" type="password" outlined dense required />
      <q-input
        v-model="form.confirmPassword"
        label="Confirm Password"
        type="password"
        outlined
        dense
        required
        :error="mismatch"
        error-message="Passwords do not match"
      />
      <q-btn :loading="loading" unelevated color="primary" label="Change Password" style="width: 100%" @click="submit" />
    </div>
  </AppBox>
</template>
