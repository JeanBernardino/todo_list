import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from './firebase-config'
import './App.css';

function App() {
  const options = [
    { value: "all", label: "all" },
    { value: "archived", label: "archived" },
    { value: "pending", label: "pending" }
  ]

  const [isEdit, setIsEdit] = useState(true)
  const [editTitle, setEditTitle] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [selected, setSelected] = useState(options[0].value);
  const [tasks, setTasks] = useState([])
  const tasksCollectionRef = collection(db, 'tasks')

  const createTask = async () => {
    setNewTitle('')
    await addDoc(tasksCollectionRef, {title: newTitle, archived: false, pending: true})
    await getTasks()
  }

  const deleteTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id)
    await deleteDoc(taskDoc)
    await getTasks()
  }

  const editTask = async (id) => {

  }

  const archiveTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id)
    const newFields = { archived: true, pending: false }
    await updateDoc(taskDoc, newFields)
  }

  const getTasks = async (selected) => {
    const type = selected == 'all' ? null : selected
    console.log(type)

    if (type == null){
      const data = (await getDocs(tasksCollectionRef))
      setTasks(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
    } else {
      const q = query(tasksCollectionRef, where(selected, '==', true))
      const data = (await getDocs(q))
      setTasks(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
    }
  }

  const handleSelect = event => {
    setSelected(event.target.value);
    getTasks(event.target.value)
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
        >
        </input>
        <button onClick={createTask}>New Task</button>
        <select value={selected} onChange={handleSelect}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>
      </div>

      {tasks.map((task) => {
        return (
          <div key={task.id}>
            <h1>Task: {task.title}</h1>
            <button onClick={() => {editTask(task.id)}}>Edit</button>
            <button onClick={() => {archiveTask(task.id)}}>Archive</button>
            <button onClick={() => {deleteTask(task.id)}}>Delete</button>
          </div>
        )
      })}
    </div>
  )
}

export default App;