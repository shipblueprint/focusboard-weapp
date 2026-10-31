import { ComponentType } from 'react'
import { Provider } from 'react-redux'
import Taro from '@tarojs/taro'
import store from './store'
import './app.css'

interface AppProps {
  children?: React.ReactNode
}

const App: ComponentType<AppProps> = ({ children }) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}

export default App
