import prodConfig from './index'

const prod = {
  ...prodConfig,
  mode: {
    mini: {},
    h5: {}
  }
}

export default prod
