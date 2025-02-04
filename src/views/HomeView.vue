<script setup lang="ts">
import { ref } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
const name: string = ref('')
const referenceDate = ref(null)
let page = 0
const auth = getAuth()
onAuthStateChanged(auth, (user) => {
  if (user) {
    name.value = user.displayName
  } else {
  }
})

const foodspends = ref([])

const setupWeekStarting = () => {
  if (!localStorage.getItem('weekStarting')) {
    let lastMonday = new Date()
    lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() - 6)
    localStorage.setItem('weekStarting', lastMonday.toDateString())
  }

  let weekStarting = new Date(localStorage.getItem('weekStarting'))
  referenceDate.value = weekStarting
}
setupWeekStarting()

const getLeaderboard = async () => {
  foodspends.value = []
  let weekStartingString =
    referenceDate.value.getFullYear() +
    '-' +
    (referenceDate.value.getMonth() + 1) +
    '-' +
    referenceDate.value.getDate()

  const querySnapshot = await getDocs(collection(db, 'foodspends'))
  querySnapshot.forEach((doc) => {
    foodspends.value.push({
      id: doc.id,
      name: doc.data().name,
      amount: doc.data()[weekStartingString] || null,
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
  page += change

  if (page != 0) {
    document.querySelector('#plusoneweek')?.removeAttribute('disabled')
  } else {
    document.querySelector('#plusoneweek')?.setAttribute('disabled', 'true')
  }
  let weekStarting = new Date(localStorage.getItem('weekStarting'))
  weekStarting.setDate(weekStarting.getDate() + change * 7)
  localStorage.setItem('weekStarting', weekStarting.toDateString())
  referenceDate.value = weekStarting
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
      <RouterLink to="/submit">Make Submission</RouterLink>
      <RouterLink to="/logout">Logout</RouterLink>
    </nav>
  </header>
  <main>
    <h2>Food Spend Leaderboard</h2>
    <p>
      All food spending including takeaways/restaurants for the week starting
      {{ referenceDate?.toDateString() }}.
    </p>
    <div id="controls">
      <button @click="changeWeek(-1)">-1 week</button>
      <button id="plusoneweek" disabled="true" @click="changeWeek(1)">+1 week</button>
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
</style>
