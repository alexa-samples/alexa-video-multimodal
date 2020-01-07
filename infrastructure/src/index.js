import 'babel-polyfill'
import { Infrastructure } from './infrastructure'
import { LogUtil } from './util/log-util'

// Run the program
LogUtil.configure()
const argv = process.argv
Infrastructure.run(argv)
