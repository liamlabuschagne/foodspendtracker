<script setup lang="ts">
import { ref } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
const name: string = ref('')
const weekStart = ref(null)
const auth = getAuth()
onAuthStateChanged(auth, (user) => {
  if (user) {
    name.value = user.displayName
  } else {
  }
})

const foodspends = ref([])

const setupLastMonday = () => {
  if (!localStorage.getItem('lastMonday')) {
    let lastMonday = new Date()
    lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() - 6)
    localStorage.setItem('lastMonday', lastMonday.toDateString())
  }

  let lastMonday = new Date(localStorage.getItem('lastMonday'))
  weekStart.value = lastMonday
}
setupLastMonday()

const getLeaderboard = async () => {
  foodspends.value = []
  let lastMonday = new Date(localStorage.getItem('lastMonday'))
  let weekStartString =
    lastMonday.getFullYear() + '-' + (lastMonday.getMonth() + 1) + '-' + lastMonday.getDate()

  const querySnapshot = await getDocs(collection(db, 'foodspends'))
  querySnapshot.forEach((doc) => {
    foodspends.value.push({
      id: doc.id,
      name: doc.data().name,
      amount: doc.data()[weekStartString] || null,
    })

    foodspends.value = foodspends.value.sort((a, b) => {
      if (a.amount === null) {
        return 1
      }
      if (b.amount === null) {
        return -1
      }
      return a.amount - b.amount
    })
  })
}

const changeWeek = (change: number) => {
  let lastMonday = new Date(localStorage.getItem('lastMonday'))
  lastMonday.setDate(lastMonday.getDate() + change * 7)
  localStorage.setItem('lastMonday', lastMonday.toDateString())
  weekStart.value = lastMonday
  getLeaderboard()
}

getLeaderboard()
</script>
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
    <h2>Food Spend Leaderboard</h2>
    <button @click="changeWeek(-1)">-1 week</button>
    <button @click="changeWeek(1)">+1 week</button>
    <p>For the week starting {{ weekStart?.toDateString() }}</p>
    <table id="leaderboard">
      <thead>
        <tr>
          <th>Name</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in foodspends" :key="user.id">
          <td>{{ user.name }}</td>
          <td>{{ user.amount ? '$' + user.amount : 'Not submitted' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
#leaderboard {
  display: block;
  text-align: left;
}
#leaderboard td,
#leaderboard th {
  padding: 0.5rem;
}
</style>
