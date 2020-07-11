import React from 'react'
import './App.css'
import Editor from './components/editor/editor'
import { GlobalOptionsProvider } from './context/GlobalOptions'

export default function App() {
  return (
    <div>
      <GlobalOptionsProvider>
        <Editor/>
      </GlobalOptionsProvider>
    </div>
  )
}
