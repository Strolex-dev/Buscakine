<script setup lang="ts">
import { ref } from 'vue'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'
import AppBox from '@/components/shared/AppBox.vue'

const props = defineProps<{ email: string }>()
const code = defineModel<string>('code', { required: true })

const emit = defineEmits<{
  'go-login': []
  'code-verified': []
}>()

const loading = ref(false)

async function checkCode() {
  loading.value = true
  try {
    const { data } = await api.get('/users/validate_code', { params: { email: props.email, code: code.value } })
    if (data.status === 'success') {
      Notify.create({ type: 'positive', message: data.message })
      emit('code-verified')
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
    <q-btn flat dense no-caps icon="arrow_back" label="Back" class="q-mb-sm" @click="emit('go-login')" />

    <p>Enter the code sent to your email</p>

    <q-input v-model="code" label="Code" type="text" outlined dense required autofocus />

    <q-btn
      :loading="loading"
      unelevated
      color="primary"
      label="Verify"
      style="width: 100%; margin-top: 10px"
      @click="checkCode"
    />
  </AppBox>
</template>
