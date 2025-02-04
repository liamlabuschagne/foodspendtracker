<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
onMounted(() => {
  document.title = 'Food Spend Tracker'
})
</script>

<template>
  <RouterView />
</template>
