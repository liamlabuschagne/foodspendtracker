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
  <header>
    <h1>Food Spend Tracker</h1>
    <p>See how your weekly food spending compares to other people!</p>
    <nav v-if="name === ''">
      <RouterLink to="/login">Login</RouterLink>
    </nav>
    <nav v-else>
      <RouterLink to="/submit">Make submission</RouterLink>
      <RouterLink to="/logout">Logout</RouterLink>
    </nav>
  </header>
  <main v-if="name !== ''">
    <h2>Food Spend Leaderboard</h2>
    <p>
      This includes all sources of food include takeaways/restaurants for the week starting
      {{ weekStart?.toDateString() }}
    </p>
    <div id="controls">
      <button @click="changeWeek(-1)">-1 week</button>
      <button @click="changeWeek(1)">+1 week</button>
    </div>
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
  </main>
</template>
<style scoped>
#leaderboard {
  display: block;
  text-align: left;
  width: 100%;
}
#leaderboard td,
#leaderboard th {
  padding: 0.5rem;
  width: 100%;
}

#leaderboard th {
  background-color: #f0f0f0;
}

#leaderboard tbody tr:nth-child(odd) {
  background-color: #f0f0f0;
}

#leaderboard tbody tr:nth-child(even) {
  background-color: #e0e0e0;
}

#leaderboard tbody tr:hover {
  background-color: #d0d0d0;
}

#controls {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

main {
  margin: auto;
  width: 100%;
  max-width: 500px;
}

button {
  /* Some nice colouring and slightly rounded borders */
  background-color: #f0f0f0;
  border: 1px solid #d0d0d0;
  border-radius: 0.25rem;
  padding: 1rem;
}

button:hover {
  background-color: #e0e0e0;
  cursor: pointer;
}

p {
  margin: 0.5rem;
}

RouterLink {
  margin: 0.5rem;
}

* {
  font-family: 'Open Sans', sans-serif;
}

/* Centre the content in the page, add some nice fonts, styling, padding and put the links in a menu */
h1 {
  text-align: center;
}

h2 {
  text-align: center;
}

header p {
  text-align: center;
}

nav {
  display: flex;
  flex-direction: row;
  width: fit-content;
  margin: 0 auto;
  gap: 1rem;
}
</style>
