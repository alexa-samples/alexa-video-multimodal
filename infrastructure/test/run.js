import Jasmine from 'jasmine'
import { FilesystemAccess } from '../src/access/filesystem-access'
import path from 'path'
import uuidv4 from 'uuid/v4'

global._babelPolyfill = false
const jasmine = new Jasmine()
jasmine.loadConfigFile('./jasmine.json')

// These spies are set up to prevent accidentally writing to the actual file system during tests
export var mkdirSpy
export var touchSpy
export var checkIfFileOrDirectoryExistsSpy
export var getCurrentWorkingDirectorySpy
export var getHomeDirectorySpy
export var readFileSpy
export var writeFileSpy
export var chmodSpy
export var createReadStreamSpy
export var listFilesSpy
beforeEach(() => {
  mkdirSpy = spyOn(FilesystemAccess, 'mkdir').and.callFake(() => {
    throw new Error('FilesystemUtil.mkdir should never be called without setting up a proper spy.')
  })
  touchSpy = spyOn(FilesystemAccess, 'touch').and.callFake(() => {
    throw new Error('FilesystemUtil.touch should never be called without setting up a proper spy.')
  })
  checkIfFileOrDirectoryExistsSpy = spyOn(FilesystemAccess, 'checkIfFileOrDirectoryExists').and.callFake(() => {
    throw new Error('FilesystemUtil.checkIfFileOrDirectoryExists should never be called without setting up a proper spy.')
  })
  getCurrentWorkingDirectorySpy = spyOn(FilesystemAccess, 'getCurrentWorkingDirectory').and.callFake(() => {
    return path.sep + 'tmp' + path.sep + uuidv4()
  })
  getHomeDirectorySpy = spyOn(FilesystemAccess, 'getHomeDirectory').and.callFake(() => {
    return path.sep + 'tmp' + path.sep + uuidv4()
  })
  readFileSpy = spyOn(FilesystemAccess, 'readFile').and.callFake(() => {
    throw new Error('FilesystemUtil.readFile should never be called without setting up a proper spy.')
  })
  writeFileSpy = spyOn(FilesystemAccess, 'writeFile').and.callFake(() => {
    throw new Error('FilesystemUtil.writeFile should never be called without setting up a proper spy.')
  })
  chmodSpy = spyOn(FilesystemAccess, 'chmod').and.callFake(() => {
    throw new Error('FilesystemUtil.chmod should never be called without setting up a proper spy.')
  })
  createReadStreamSpy = spyOn(FilesystemAccess, 'createReadStream').and.callFake(() => {
    throw new Error('FilesystemUtil.createReadStream should never be called without setting up a proper spy.')
  })
  listFilesSpy = spyOn(FilesystemAccess, 'listFiles').and.callFake(() => {
    throw new Error('FilesystemUtil.listFiles should never be called without setting up a proper spy.')
  })
})

jasmine.execute()
