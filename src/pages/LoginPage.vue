<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import LoginForm from '@/components/auth/LoginForm.vue'
import SignUpForm from '@/components/auth/SignUpForm.vue'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue'
import CredentialsSentForm from '@/components/auth/CredentialsSentForm.vue'
import ChangePasswordForm from '@/components/auth/ChangePasswordForm.vue'

type AuthState = 'login' | 'signup' | 'forgotPass' | 'credentialsSent' | 'changePass'

const route = useRoute()
const state = ref<AuthState>('login')
const email = ref((route.query.email as string) ?? '')
const code = ref((route.query.code as string) ?? '')
</script>

<template>
  <q-page>
    <div id="AuthContainer">
      <LoginForm
        v-if="state === 'login'"
        @go-signup="state = 'signup'"
        @go-forgot-pass="state = 'forgotPass'"
      />
      <SignUpForm v-else-if="state === 'signup'" />
      <ForgotPasswordForm
        v-else-if="state === 'forgotPass'"
        v-model:email="email"
        @go-login="state = 'login'"
        @code-sent="state = 'credentialsSent'"
      />
      <CredentialsSentForm
        v-else-if="state === 'credentialsSent'"
        v-model:code="code"
        :email="email"
        @go-login="state = 'login'"
        @code-verified="state = 'changePass'"
      />
      <ChangePasswordForm
        v-else-if="state === 'changePass'"
        :email="email"
        :code="code"
        @go-login="state = 'login'"
      />
    </div>
  </q-page>
</template>
