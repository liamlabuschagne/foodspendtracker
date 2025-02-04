<script setup lang="ts">
import { ref } from 'vue'
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { db } from '../firebase'
import { onMounted } from 'vue'
const isLoggedIn = ref(false)
const referenceDate = ref<Date>(new Date())
const page = ref(0)
const auth = getAuth()
const router = useRouter()
const provider = new GoogleAuthProvider()

onAuthStateChanged(auth, (user) => {
  if (user) {
    isLoggedIn.value = true
  } else {
    isLoggedIn.value = false
  }
})

type FoodSpend = {
  id: string
  name: string
  amount: number | null
}

const foodspends = ref<Array<FoodSpend>>([])

const getLeaderboard = async () => {
  if (!referenceDate.value) {
    return
  }
  foodspends.value = []
  let weekStartingString =
    referenceDate.value.getFullYear() +
    '-' +
    (referenceDate.value.getMonth() + 1) +
    '-' +
    referenceDate.value.getDate()

  const querySnapshot = await getDocs(collection(db, 'foodspends'))
  querySnapshot.forEach((doc) => {
    foodspends?.value.push({
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
  page.value += change
  localStorage.setItem('page', page.value.toString())
  console.log('Page is', page.value)
  if (page.value === 0) {
    document.querySelector('#plusoneweek')?.setAttribute('disabled', 'true')
  } else {
    document.querySelector('#plusoneweek')?.removeAttribute('disabled')
  }

  let weekStarting = new Date(localStorage.getItem('weekStarting') || '')
  weekStarting.setDate(weekStarting.getDate() + change * 7)
  localStorage.setItem('weekStarting', weekStarting.toDateString())
  referenceDate.value = weekStarting
  getLeaderboard()
}

const setup = () => {
  if (!localStorage.getItem('page')) {
    localStorage.setItem('page', '0')
  }
  page.value = parseInt(localStorage.getItem('page') || '0')

  if (!localStorage.getItem('weekStarting')) {
    let lastMonday = new Date()
    lastMonday.setDate(lastMonday.getDate() - lastMonday.getDay() - 6)
    localStorage.setItem('weekStarting', lastMonday.toDateString())
  }

  let weekStarting = new Date(localStorage.getItem('weekStarting') || '')
  referenceDate.value = weekStarting
  changeWeek(0)
}

onMounted(() => {
  setup()
})

const signinWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      auth.currentUser &&
        setDoc(
          doc(db, 'foodspends', auth.currentUser.uid),
          {
            name: result.user.displayName,
          },
          { merge: true },
        )
          .then(() => {
            router.push('/')
          })
          .catch((error) => {
            console.log(error)
          })
    })
    .catch((error) => {
      console.log(error)
    })
}
const logout = () => {
  signOut(auth).then(() => {
    isLoggedIn.value = false
  })
}
</script>
<template>
  <header>
    <h1>Food Spend Tracker</h1>
    <p>See how your weekly food spending compares to other people!</p>
    <nav v-if="!isLoggedIn">
      <button @click="signinWithGoogle">Login with Google</button>
    </nav>
    <nav v-else>
      <RouterLink to="/submit">Make Submission</RouterLink>
      <button @click="logout">Logout</button>
    </nav>
  </header>
  <main>
    <h2>Food Spend Leaderboard</h2>
    <p>
      All food spending including takeaways/restaurants for the week starting
      {{ referenceDate?.toDateString() }}.
    </p>
    <div id="controls">
      <button @click="changeWeek(-1)">&larr;</button>
      <button @click="getLeaderboard">&#10227; Refresh</button>
      <button id="plusoneweek" @click="changeWeek(1)">&rarr;</button>
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
