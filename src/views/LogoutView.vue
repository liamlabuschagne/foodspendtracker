<template></template>
<script setup lang="ts">
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'

const auth = getAuth()
const router = useRouter()
signOut(auth)
  .then(() => {
    // Sign-out successful.
    router.push('/')
  })
  .catch((error) => {
    // An error happened.
    router.push('/')
  })
</script>
