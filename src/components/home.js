import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
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
    setNewTitle('')
    await addDoc(tasksCollectionRef, {title: newTitle, finished: false, archived: false, pending: true})
    await getTasks(selected)
  }

  const deleteTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id)
    await deleteDoc(taskDoc)
    await getTasks(selected)
  }

  const editTask = async (task) => {
    setEditTitle(task.title)
    setTaskEdit(task.id)
  }

  const updateTask = async (task) => {
    const taskDoc = doc(db, 'tasks', task.id)
    const newFields = { title: editTitle }
    await updateDoc(taskDoc, newFields)

    setEditTitle('')
    setTaskEdit(0)
    await getTasks(selected)
  }

  const archiveTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id)
    const newFields = { archived: true, pending: false }

    await updateDoc(taskDoc, newFields)
    await getTasks(selected)
  }

  const finishTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id)
    const newFields = { finished: true, pending: false }

    await updateDoc(taskDoc, newFields)
    await getTasks(selected)
  }

  const getTasks = async (selected) => {
    console.log(selected)
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
      <div className="form">
        <input placeholder="Your task..."
          value={newTitle}
          onInput={(event) => {
            setNewTitle(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') createTask()
          }}
        />
        <button onClick={createTask}>New Task</button>
        <select value={selected} onChange={handleSelect}>
          {options.map(option => (
            <option key={option.value} value={option.label} selected={selected === option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {tasks.map((task) => {
        return (
          <div key={task.id}>
            <h1>Task: {task.title}</h1>
            { taskEdit === task.id && <input placeholder="Your task..." value={editTitle} onInput={(event) => { setEditTitle(event.target.value) }} onKeyDown={(event) => { if (event.key === 'Enter') updateTask(task) }} /> }
            <button onClick={() => {editTask(task)}}>Edit</button>
            <button onClick={() => {archiveTask(task.id)}}>Archive</button>
            <button onClick={() => {finishTask(task.id)}}>Finish</button>
            <button onClick={() => {deleteTask(task.id)}}>Delete</button>
          </div>
        )
      })}
    </div>
  )
}

export default Home;