import { useState } from 'react'
import { auth, googleProvider } from '../firebase-config'
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className='d-flex flex-column align-items-center flex-content-center'>
      <div className="my-3">
        <input 
          className="form-control"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Passwod"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="d-flex flex-column align-items-center ">
        { auth?.currentUser?.uid == null && <button className="btn btn-dark my-1" onClick={signIn}>Sign in</button> }
        { auth?.currentUser?.uid == null && <button className="btn btn-dark my-1" onClick={signInWithGoogle}>Sign in with Google</button> }
        { auth?.currentUser?.uid != null && <button className="btn btn-dark my-1" onClick={logout}>Logout</button> }
      </div>
    </div>
  )
}

export default Auth