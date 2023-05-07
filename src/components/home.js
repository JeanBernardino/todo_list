import { useState, useEffect } from 'react';
import { auth } from '../firebase-config'
import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '../firebase-config'
import '../App.css';

function Home() {
  const options = [
    { value: "all", label: "all" },
    { value: "archived", label: "archived" },
    { value: "finished", label: "finished" },
    { value: "pending", label: "pending" }
  ]

  const [taskEdit, setTaskEdit] = useState(0)
  const [editTitle, setEditTitle] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [selected, setSelected] = useState(options[0].value);
  const [tasks, setTasks] = useState([])
  const tasksCollectionRef = collection(db, 'tasks')

  const createTask = async () => {
    if (auth?.currentUser !== null){
      console.log(auth?.currentUser)

      setNewTitle('')
      await addDoc(tasksCollectionRef, {title: newTitle, finished: false, archived: false, pending: true, userId: auth?.currentUser?.uid, blocked: false})
      await getTasks(selected)
    } else {
      alert('Please, signin to create a task!')
    }
  }

  const deleteTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id)
    const taskData = await getDoc(taskDoc)
    
    if(taskData.data().blocked === false || taskData.data().userId === auth?.currentUser?.uid){
      await deleteDoc(taskDoc)
      await getTasks(selected)
    } else {
      alert("You don't have permission to do that!")
    }
  }

  const editTask = async (task) => {
    setEditTitle(task.title)
    setTaskEdit(task.id)
  }

  const updateTask = async (task) => {
    const taskDoc = doc(db, 'tasks', task.id)
    const taskData = await getDoc(taskDoc)

    if(editTitle === '' || editTitle === null){
      alert("The title can't be empty!")
      return
    }

    if(taskData.data().blocked === false || taskData.data().userId === auth?.currentUser?.uid){
      const newFields = { title: editTitle }
      await updateDoc(taskDoc, newFields)

      setEditTitle('')
      setTaskEdit(0)
      await getTasks(selected)
    } else {
      alert("You don't have permission to do that!")
    }
  }

  const archiveTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id)
    const taskData = await getDoc(taskDoc)

    if(taskData.data().blocked === false || taskData.data().userId === auth?.currentUser?.uid){
      const newFields = { archived: true, pending: false }
      await updateDoc(taskDoc, newFields)
      await getTasks(selected)
    } else {
      alert("You don't have permission to do that!")
    }
  }

  const blockTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id)
    const taskData = await getDoc(taskDoc)

    if(taskData.data().userId === auth?.currentUser?.uid){
      const newFields = { blocked: true }
      await updateDoc(taskDoc, newFields)
      await getTasks(selected)
    } else {
      alert("You don't have permission to do that!")
    }
  }

  const finishTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id)
    const taskData = await getDoc(taskDoc)

    if(taskData.data().blocked === false || taskData.data().userId === auth?.currentUser?.uid){
      const newFields = { finished: true, pending: false }
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

  useEffect(() => {
    getTasks(selected)
  }, [])

  return (
    <div className="App">
      <div className="d-flex flex-column flex-xl-row align-items-center justify-content-center">
        <input 
          className="form-control task-input"
          placeholder="Your task..."
          value={newTitle}
          onInput={(event) => {
            setNewTitle(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') createTask()
          }}
        />
        <button className="btn btn-dark my-2 mx-xl-2" onClick={createTask}>New task</button>
        <select className="form-select task-select" value={selected} onChange={handleSelect}>
          {options.map(option => (
            <option key={option.value} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {tasks.map((task) => {
        return (
          <div className="my-2" key={task.id}>
            <div className="mb-3 d-flex flex-column align-items-center justify-content-center">
              <label className="form-label h3 fw-bold"><span>{task.title}</span></label>
              { taskEdit === task.id && <input className="form-control task-input" placeholder="Your task..." value={editTitle} onInput={(event) => { setEditTitle(event.target.value) }} onKeyDown={(event) => { if (event.key === 'Enter') updateTask(task) }} /> }
            </div>
            <div>
              <button className="btn btn-dark my-2 mx-1" onClick={() => {editTask(task)}}>Edit</button>
              <button className="btn btn-secondary my-2 mx-1" onClick={() => {archiveTask(task.id)}}>Archive</button>
              <button className="btn btn-success my-2 mx-1" onClick={() => {finishTask(task.id)}}>Finish</button>
              <button className="btn btn-warning my-2 mx-1" onClick={() => {blockTask(task.id)}}>Block</button>
              <button className="btn btn-danger my-2 mx-1" onClick={() => {deleteTask(task.id)}}>Delete</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Home;