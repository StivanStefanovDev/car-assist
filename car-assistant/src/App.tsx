import './App.css'
import HomePage from './pages/HomePage'

function App() {

  return (
    <>
      <HomePage onStartListening={() => console.log('Listening started')} />
    </>
  )
}

export default App
