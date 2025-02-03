<template>
  <h1>Home</h1>
  <div v-if="name === ''">
    <RouterLink to="/login">Login</RouterLink>
  </div>
  <div v-else>
    <p>Welcome {{ name }}</p>
    <RouterLink to="/submit">Make submission</RouterLink>
    <br />
    <br />
    <RouterLink to="/logout">Logout</RouterLink>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
let name: string = ref('')
const auth = getAuth()
onAuthStateChanged(auth, (user) => {
  if (user) {
    name.value = user.displayName
  } else {
  }
})
</script>
