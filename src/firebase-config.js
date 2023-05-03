import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: 'AIzaSyAdS4mjumbVLjyMv08w79_zeqiL9S77o9w',
    authDomain: 'todo-bfb35.firebaseapp.com',
    projectId: 'todo-bfb35',
    storageBucket: 'todo-bfb35.appspot.com',
    messagingSenderId: '679095758846',
    appId: '1:679095758846:web:00e7e10a16b13c80895aaf'
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)