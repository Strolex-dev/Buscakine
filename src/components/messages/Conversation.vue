<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'
import ImageUploader from '@/components/shared/ImageUploader.vue'
import ImageViewer from './ImageViewer.vue'

const props = defineProps<{ conversationId: string }>()

interface Message {
  message_text: string
  image?: string
  sent_at: string
  is_owner: boolean
}

const { data: messagesData, execute: fetchMessages } = useApiRequest<{ messages: Message[] }>()
const formValues = reactive({ message_text: '', image: '', conversation_id: '' })
const file = ref<File | null>(null)
const openImageViewer = ref(false)
const selectedImage = ref('')

async function loadConversation() {
  await fetchMessages({ url: '/messages', query: { conversation_id: props.conversationId } })
  await useApiRequest().execute({ url: '/messages/markAsViewed', method: 'POST', body: { conversation_id: props.conversationId } })
  await nextTick()
  const container = document.querySelector('.conversation_container')
  if (container) setTimeout(() => (container.scrollTop = container.scrollHeight), 100)
}

watch(() => props.conversationId, loadConversation, { immediate: true })

async function handleSendMessage() {
  if (formValues.message_text.trim() === '' && !file.value) return
  formValues.conversation_id = props.conversationId

  const body = new FormData()
  body.append('formValues', JSON.stringify(formValues))
  if (file.value) body.append('image', file.value)

  const response = await useApiRequest<{ status: string }>().execute({
    url: '/messages/send',
    method: 'POST',
    formData: true,
    body,
  })
  if (response.status === 'success') {
    formValues.message_text = ''
    formValues.image = ''
    file.value = null
    loadConversation()
  }
}

function viewImage(image: string) {
  selectedImage.value = image
  openImageViewer.value = true
}
</script>

<template>
  <div class="conversation_container">
    <div
      v-for="(message, index) in messagesData?.messages ?? []"
      :key="index"
      :class="message.is_owner ? 'message_container_owner' : 'message_container_other'"
    >
      <div class="message_bubble">
        <img v-if="message.image" :src="message.image" class="message_image" @click="viewImage(message.image!)" />
        {{ message.message_text }}
        <div class="message_footer">
          <div class="message_date">{{ message.sent_at }}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="message_input_container">
    <ImageUploader
      uploader-class="message_image_uploader"
      :image="formValues.image"
      label=""
      @update:image="(img: string) => (formValues.image = img)"
      @update:file="(f: File) => (file = f)"
    />
    <q-input
      v-model="formValues.message_text"
      outlined
      dense
      placeholder="Escribe un mensaje..."
      style="margin-left: 10px; flex: 1"
      @keyup.enter="handleSendMessage"
    />
    <q-btn unelevated color="primary" label="Enviar" style="margin-left: 10px" @click="handleSendMessage" />
  </div>

  <ImageViewer v-model:open="openImageViewer" :image-src="selectedImage" />
</template>
