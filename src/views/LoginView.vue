<template>
  <h1>Login</h1>
  <button @click="signinWithGoogle">Signin with Google</button>
</template>

<script setup lang="ts">
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'vue-router'
const router = useRouter()
const provider = new GoogleAuthProvider()
const auth = getAuth()

const signinWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      router.push('/')
    })
    .catch((error) => {
      console.log(error)
    })
}
</script>

<style></style>
