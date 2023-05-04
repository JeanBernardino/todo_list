import { useState, useEffect } from 'react'
import { auth, googleProvider } from '../firebase-config'
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const signIn = async () => {
    if (email === '' || password === '') {
      alert('Please, no field should be blank!')
      return
    }

    if (!email.includes('@')) {
      alert('Email not valid!')
      return
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      loadUser()
      setEmail('')
      setPassword('')
    } catch (error) {
      console.error(error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error(error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error(error)
    }
  }

  const loadUser = () => {
    setUser(auth?.currentUser)
  }

  useEffect(() => {
    loadUser()
  }, [])

  return (
    <div>
      <input 
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Passwod"
        value={password}
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signIn}>Sign in</button>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
      { user != null && <button onClick={logout}>Logout</button> }
    </div>
  )
}

export default Auth