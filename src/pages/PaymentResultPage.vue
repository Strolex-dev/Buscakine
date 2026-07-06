<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <q-page class="content">
    <h1>Payment Result</h1>
    <p v-for="(value, key) in route.query" :key="key">
      <strong>{{ key }}:</strong> {{ value }}
    </p>
  </q-page>
</template>
