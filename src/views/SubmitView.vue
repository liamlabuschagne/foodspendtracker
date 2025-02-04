<template>
  <header>
    <h1>Make Submission</h1>
    <nav>
      <RouterLink to="/">Home</RouterLink>
    </nav>
  </header>
  <main>
    <p>
      All food spending including takeaways/restaurants for the week starting
      {{ lastMonday.toDateString() }}:
      <span v-if="currentValue">${{ currentValue }}</span>
      <span v-else>Not submitted</span>
    </p>
    <form @submit="submitForm">
      <label for="amount">Amount: $</label>
      <input type="number" name="amount" step="0.01" />
      <button v-if="currentValue" type="submit">Update</button>
      <button v-else type="submit">Submit</button>
    </form>
  </main>
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
const router = useRouter()
const today = new Date().toISOString().split('T')[0]

// Get the date of the monday of the last full week
let lastMonday = new Date()
lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() - 6)
let weekStartString =
  lastMonday.getFullYear() + '-' + (lastMonday.getMonth() + 1) + '-' + lastMonday.getDate()

const getCurrentValue = async () => {
  const docRef = auth.currentUser && doc(db, 'foodspends', auth.currentUser.uid)
  const docSnap = docRef && (await getDoc(docRef))
  if (docSnap?.exists()) {
    currentValue.value = docSnap.data()[weekStartString]
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

  auth.currentUser &&
    setDoc(
      doc(db, 'foodspends', auth.currentUser.uid),
      {
        [weekStartString]: parseFloat(amount),
      },
      { merge: true },
    )
      .then(() => {
        getCurrentValue()
        input.amount.value = ''
      })
      .catch((error) => {
        console.error('Error writing document: ', error)
      })
}
</script>
