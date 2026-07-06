<script setup lang="ts">
import { ref } from 'vue'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'
import AppBox from '@/components/shared/AppBox.vue'

const email = defineModel<string>('email', { required: true })

const emit = defineEmits<{
  'go-login': []
  'code-sent': []
}>()

const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    const { data } = await api.get('/users/password_recovery', { params: { email: email.value } })
    if (data.status === 'success') {
      Notify.create({ type: 'positive', message: data.message })
      emit('code-sent')
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
    <q-btn
      flat
      dense
      no-caps
      icon="arrow_back"
      label="Back"
      class="q-mb-sm"
      @click="() => { email = ''; emit('go-login') }"
    />

    <form class="form" @submit.prevent="submit">
      <q-input v-model="email" label="Email" type="text" autocomplete="email" outlined dense required autofocus />
      <q-btn type="submit" :loading="loading" unelevated color="primary" label="Send" style="width: 100%" />
    </form>
  </AppBox>
</template>
