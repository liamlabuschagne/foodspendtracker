<template>
  <h1>Submit</h1>
  <p>Submit your food spend for the week starting {{ lastMonday.toDateString() }}</p>
  <p v-if="currentValue">Current value: ${{ currentValue }}</p>
  <form @submit="submitForm">
    <label for="amount">Amount: $</label>
    <input type="text" name="amount" placeholder="123.45" />
    <button type="submit">Submit</button>
  </form>
  <RouterLink to="/">Home</RouterLink>
</template>

<script setup lang="ts">
import { db } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const auth = getAuth()
const currentValue = ref<number | null>(null)

const today = new Date().toISOString().split('T')[0]

// Get the date of the monday of the last full week
let lastMonday = new Date()
lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() - 6)
let weekStartString =
  lastMonday.getFullYear() + '-' + (lastMonday.getMonth() + 1) + '-' + lastMonday.getDate()

const getCurrentValue = async () => {
  const docRef = doc(db, 'foodspends', auth.currentUser.uid, 'foodspends', weekStartString)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    currentValue.value = docSnap.data().amount
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    getCurrentValue()
  } else {
    router.push('/')
  }
})

const submitForm = (event: Event) => {
  event.preventDefault()
  const input = event.target as HTMLFormElement
  const amount = input.amount.value

  setDoc(doc(db, 'foodspends', auth.currentUser.uid, 'foodspends', weekStartString), {
    amount: amount,
  })
    .then(() => {
      alert('Submitted $' + amount + ' for the week starting ' + lastMonday.toDateString())
      getCurrentValue()
      input.amount.value = ''
    })
    .catch((error) => {
      console.error('Error writing document: ', error)
    })
}
</script>
