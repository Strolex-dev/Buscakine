<script setup lang="ts">
import { ref } from 'vue'

const phoneNumber = '56957285973'
const message = 'Hola, necesito más información.'
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

const showBubble = ref(true)

const openWhatsApp = () => window.open(whatsappUrl, '_blank')
</script>

<template>
  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <div class="whatsapp_widget">
      <div v-if="showBubble" class="whatsapp_bubble" @click="openWhatsApp">
        <q-btn
          class="whatsapp_bubble_close"
          flat
          round
          dense
          icon="close"
          size="sm"
          @click.stop="showBubble = false"
        />
        ¡Hola! ¿Necesitas ayuda para encontrar un kinesiólogo?
      </div>
      <q-btn fab icon="fa-brands fa-whatsapp" style="background-color: #25D366; color: white" @click="openWhatsApp" />
    </div>
  </q-page-sticky>
</template>

<style scoped>
.whatsapp_widget {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.whatsapp_bubble {
  position: relative;
  max-width: 220px;
  background: #fff;
  color: var(--color-text);
  padding: 14px 16px;
  border-radius: 14px 14px 2px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
}

.whatsapp_bubble_close {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
