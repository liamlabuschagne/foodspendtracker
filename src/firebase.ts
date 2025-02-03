// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCUTkyNLpWWGUrwTKw0spIRHLX8nEYJja8',
  authDomain: 'foodspendtracker.firebaseapp.com',
  projectId: 'foodspendtracker',
  storageBucket: 'foodspendtracker.firebasestorage.app',
  messagingSenderId: '313381542675',
  appId: '1:313381542675:web:f7aec9099706d119c1d8e6',
  measurementId: 'G-71QP2644XZ',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const db = getFirestore(app)

export { db, app, analytics }
