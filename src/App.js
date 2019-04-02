import React from 'react'
import mic from './microphone.svg'
import './App.css'

//-----------------SPEECH RECOGNITION SETUP---------------------

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continous = true
recognition.interimResults = true
recognition.maxAlternatives = 5
recognition.lang = 'ru-RU'

//-----------------COMPONENT---------------------

class App extends React.Component {
  state = {
    listening: false,
    text: '',
  }

  toggleListen = () => {
    this.setState(
      (state) => ({
        ...state,
        listening: !state.listening,
      }),
      this.handleListen,
    )
  }

  handleListen = () => {
    if (this.state.listening) {
      this.setState((state) => ({ ...state, text: '' }))
      recognition.start()

      recognition.onresult = (event) => {
        const [res] = event.results
        if (res.isFinal) {
          console.log('Вы сказали 🌬: ', res[0].transcript)
          this.setState({ listening: false, text: res[0].transcript })
        }
      }
    }
  }

  render() {
    return (
      <main className="App">
        <header className="App-header">
          <h1>Голосовой сервис Sirilisa</h1>
        </header>
        <div>
          <img
            src={mic}
            className={`App-logo ${this.state.listening ? 'App-logo-active' : ''}`}
            alt="logo"
            onClick={this.toggleListen}
          />
          <p className={'App-text'}>{this.state.text}</p>
        </div>
      </main>
    )
  }
}

export default App
