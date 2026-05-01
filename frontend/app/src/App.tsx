import { useState, useEffect } from 'react'
import './App.css'
import type { User } from '@my-app/types'

function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch('http://localhost:3000/api/user')
      .then(res => res.json())
      .then((data: User) => setUser(data))
  }, [])

  return (
    <div style={{ padding: '2rem' }}>
      <h1>検証: 共有型の読み込み</h1>
      {user ? (
        <ul>
          <li>ID: {user.id}</li>
          <li>名前: {user.name}</li>
          <li>Email: {user.email}</li>
          <li>Status: <strong>{user.status}</strong></li>
        </ul>
      ) : (
        <p>読み込み中...</p>
      )}
    </div>
  )
}

export default App