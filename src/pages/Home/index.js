import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../../firebase-config'
import { signOut, signInWithPopup } from 'firebase/auth'
import { db } from '../../firebase-config'
import { Navigate } from 'react-router-dom'
import { PlusCircle, Lock } from 'react-bootstrap-icons';
import '../../App.css';

export function Home() {
  const options = [
    { value: "all", label: "all" },
    { value: "archived", label: "archived" },
    { value: "finished", label: "finished" },
    { value: "pending", label: "pending" }
  ]

  const [user, setUser] = useState({id: '', name: '', email: ''})
  const [taskEdit, setTaskEdit] = useState(0)
  const [editTitle, setEditTitle] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [selected, setSelected] = useState(options[0].value);
  const [tasks, setTasks] = useState([])
  const tasksCollectionRef = collection(db, 'tasks')

  const createTask = async () => {
    if (auth?.currentUser !== null){
      setNewTitle('')
      await addDoc(tasksCollectionRef, {title: newTitle, finished: false, archived: false, pending: true, userId: auth?.currentUser?.uid, blocked: false})
      await getTasks(selected)
      localStorage.setItem('has_change', true);
    } else {
      alert('Please, signin to create a task!')
    }
  }

  const deleteTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id)
    const taskData = await getDoc(taskDoc)
    
    if((taskData.data().blocked === false || taskData.data().userId === user.id) && user.id !== ''){
      await deleteDoc(taskDoc)
      await getTasks(selected)
    } else {
      alert("You don't have permission to do that!")
    }
  }

  const editTask = async (task) => {
    if (editTitle === ''){
      setEditTitle(task.title)
      setTaskEdit(task.id)
    } else {
      setEditTitle('')
      setTaskEdit(0)
    }
  }

  const updateTask = async (task) => {
    const taskDoc = doc(db, 'tasks', task.id)
    const taskData = await getDoc(taskDoc)

    if(editTitle === '' || editTitle === null){
      alert("The title can't be empty!")
      return
    }

    if((taskData.data().blocked === false || taskData.data().userId === user.id) && user.id !== ''){
      const newFields = { title: editTitle }
      await updateDoc(taskDoc, newFields)
      setEditTitle('')
      setTaskEdit(0)
      await getTasks(selected)
    } else {
      alert("You don't have permission to do that!")
    }
  }

  const archiveTask = async (id, archived) => {
    const taskDoc = doc(db, 'tasks', id)
    const taskData = await getDoc(taskDoc)

    if((taskData.data().blocked === false || taskData.data().userId === user.id) && user.id !== ''){
      const newFields = { archived: archived, pending: archived === true ? false : true }
      await updateDoc(taskDoc, newFields)
      await getTasks(selected)
    } else {
      alert("You don't have permission to do that!")
    }
  }

  const blockTask = async (id, blocked) => {
    const taskDoc = doc(db, 'tasks', id)
    const taskData = await getDoc(taskDoc)

    if((taskData.data().blocked === false || taskData.data().userId === user.id) && user.id !== ''){
      const newFields = { blocked: blocked }
      await updateDoc(taskDoc, newFields)
      await getTasks(selected)
    } else {
      alert("You don't have permission to do that!")
    }
  }

  const finishTask = async (id, finished) => {
    const taskDoc = doc(db, 'tasks', id)
    const taskData = await getDoc(taskDoc)

    if((taskData.data().blocked === false || taskData.data().userId === user.id) && user.id !== ''){
      const newFields = { finished: finished, pending: finished === true ? false : true }
      await updateDoc(taskDoc, newFields)
      await getTasks(selected)
    } else {
      alert("You don't have permission to do that!")
    }
  }

  const getTasks = async (selected) => {
    const q = query(tasksCollectionRef, selected === 'all' ? where('archived', '==', false) : where(selected, '==', true))
    const data = (await getDocs(q))
    setTasks(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
  }

  const handleSelect = async event => {
    setSelected(event.target.value)
    await getTasks(event.target.value)
  };

  const logout = async () => {
    try {
      await signOut(auth)
      setUser({id: '', name: '', email: ''})
    } catch (error) {
      console.error(error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider).then((result) => {
        setUser({
          id: result.user.uid,
          name: result.user.displayName,
          email: result.user.email
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  if (user.id === '' || auth?.currentUser === null){
    <Navigate to="/login" replace={true}/>
  }

  useEffect(() => {
    if (auth?.currentUser !== null && user.id === ''){
      setUser({
        id: auth?.currentUser.uid,
        name: auth?.currentUser.displayName,
        email: auth?.currentUser.email
      })
    }

    getTasks(selected)
  }, [user, tasks])

  return (
    <div className="container">
      <div className='d-flex align-items-center justify-content-center'>
        { user.id === '' && <button className="btn btn-dark my-1 mx-1" onClick={signInWithGoogle}>Sign in with Google</button> }
        { user.id !== '' &&
          <div className="alert alert-success d-flex flex-column justify-content-center align-items-center">
            <h2>Hi, {user.name}</h2>
            <button className="btn btn-dark my-1 mx-1" onClick={logout}>Logout</button>
          </div>
        }
      </div>
      
      <div className="d-flex flex-column align-items-center justify-content-center">
        <div className="d-flex align-items-center justify-content-center mb-2">
          <input 
            className="form-control"
            placeholder="Your task..."
            value={newTitle}
            onInput={(event) => {
              setNewTitle(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') createTask()
            }}
          />
          <button className="btn btn-dark my-2 mx-2 d-flex p-2" onClick={createTask}><PlusCircle size={24}/></button>
        </div>
        <select className="form-select task-select" value={selected} onChange={handleSelect}>
          {options.map(option => (
            <option key={option.value} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      { tasks.length > 0 && tasks.map((task) => {
        return (
          <div className="my-5" key={task.id}>
            <div className="d-flex flex-column align-items-center justify-content-center">
              <label className={task.finished === true ? 'alert alert-success' : 'alert'}>
                <span className="m-0 d-flex align-items-center justify-content-center" style={{textDecoration: task.archived === true ? 'line-through' : 'None'}}>
                  <h3 className="m-0">{task.title}</h3>
                  {task.blocked === true && <Lock className='ms-2' size={24}/>}
                </span>
              </label>
              { taskEdit === task.id && <input className="mb-3 form-control task-input" placeholder="Your task..." value={editTitle} onInput={(event) => { setEditTitle(event.target.value) }} onKeyDown={(event) => { if (event.key === 'Enter') updateTask(task) }} /> }
            </div>
            <div className="d-flex align-items-center justify-content-center">
              <button className="btn btn-dark mx-1" onClick={() => {editTask(task)}}>Edit</button>
              { task.archived === false && <button className="btn btn-secondary mx-1" onClick={() => {archiveTask(task.id, true)}}>Archive</button>}
              { task.archived === true && <button className="btn btn-secondary mx-1" onClick={() => {archiveTask(task.id, false)}}>Unarchive</button> }
              { task.finished === false && <button className="btn btn-success mx-1" onClick={() => {finishTask(task.id, true)}}>Finish</button>}
              { task.finished === true && <button className="btn btn-success mx-1" onClick={() => {finishTask(task.id, false)}}>Unfinish</button>}
              { task.blocked === false && <button className="btn btn-warning mx-1" onClick={() => {blockTask(task.id, true)}}>Block</button>}
              { task.blocked === true && <button className="btn btn-warning mx-1" onClick={() => {blockTask(task.id, false)}}>UnbBlock</button>}
              <button className="btn btn-danger mx-1" onClick={() => {deleteTask(task.id)}}>Delete</button>
            </div>
          </div>
        )
      })}

      { tasks.length === 0 && <h3>No task found...</h3> }
    </div>
  )
}