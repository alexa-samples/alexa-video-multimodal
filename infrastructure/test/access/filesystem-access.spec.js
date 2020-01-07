import { FilesystemAccess } from '../../src/access/filesystem-access'
import fs from 'fs'
import {
  checkIfFileOrDirectoryExistsSpy,
  chmodSpy,
  createReadStreamSpy,
  getCurrentWorkingDirectorySpy,
  getHomeDirectorySpy,
  listFilesSpy,
  mkdirSpy,
  readFileSpy,
  touchSpy,
  writeFileSpy
} from '../run'
import os from 'os'
import slash from 'slash'
import 'jasmine'

describe('FilesystemAccess', () => {
  describe('touch', () => {
    it('success', () => {
      // Arrange
      const p = 'dummy-file'
      touchSpy.and.callThrough()
      spyOn(fs, 'openSync').and.returnValue(null)
      spyOn(fs, 'closeSync').and.returnValue(null)

      // Act
      const result = FilesystemAccess.touch(p)

      // Assert
      expect(result).toBeUndefined()
    })
  })

  describe('getHomeDirectory', () => {
    it('returns defined path', () => {
      // Arrange
      getHomeDirectorySpy.and.callThrough()
      spyOn(os, 'homedir').and.returnValue('dummy-home-dir')

      // Act
      const homeDirectory = FilesystemAccess.getHomeDirectory()

      // Assert
      expect(homeDirectory).toBeDefined()
    })
  })

  it('getCurrentWorkingDirectory', () => {
    // Arrange
    getCurrentWorkingDirectorySpy.and.callThrough()
    spyOn(process, 'cwd').and.returnValue('dummy-cwd')

    // Act
    const currentWorkingDirectory = FilesystemAccess.getCurrentWorkingDirectory()

    // Assert
    expect(currentWorkingDirectory).toBeDefined()
  })

  describe('constructPath', () => {
    it('returns a path', () => {
      // Arrange
      const pathParts = ['tmp', 'random', 'path']

      // Act
      let p = FilesystemAccess.constructPath(pathParts)

      // Assert
      p = slash(p)

      expect(p).toEqual('tmp/random/path')
    })
  })

  describe('createReadStream', () => {
    it('file exists', () => {
      // Arrange
      createReadStreamSpy.and.callThrough()
      spyOn(fs, 'createReadStream').and.returnValue('dummy-stream')
      const p = 'dummy-file'

      // Act
      const readStream = FilesystemAccess.createReadStream(p)

      // Assert
      expect(readStream).toBeDefined()
    })
  })

  describe('listFiles', () => {
    it('list files in a directory', () => {
      // Arrange
      listFilesSpy.and.callThrough()
      spyOn(fs, 'readdirSync').and.returnValue(['f0', 'f1', 'f2'])
      const d = 'dummy-dir'

      // Act
      const files = FilesystemAccess.listFiles(d)

      // Assert
      expect(files.length).toEqual(3)
    })
  })

  describe('writeJsonFile', () => {
    it('writes a json file', () => {
      // Arrange
      writeFileSpy.and.returnValue(undefined)
      const p = 'dummy-file'
      const content = { key: 'value' }

      // Act
      const result = FilesystemAccess.writeJsonFile(p, content)

      // Assert
      expect(result).toBeUndefined()
    })
  })

  describe('readJsonFile', () => {
    it('reads a json file (valid content)', () => {
      // Arrange
      const p = 'dummy-file'
      const inputContent = { key: 'value' }
      readFileSpy.and.returnValue(JSON.stringify(inputContent))

      // Act
      const outputContent = FilesystemAccess.readJsonFile(p)

      // Assert
      expect(outputContent).toEqual(inputContent)
    })

    it('reads a json file (invalid content)', () => {
      // Arrange
      const p = 'dummy-file'
      const inputContent = 'junk-content'
      readFileSpy.and.returnValue(inputContent)

      // Act/Assert
      expect(() => FilesystemAccess.readJsonFile(p)).toThrow()
    })

    it('reads a json file (invalid content, error ignored)', () => {
      // Arrange
      const p = 'dummy-file'
      const inputContent = 'junk-content'
      readFileSpy.and.returnValue(inputContent)

      // Act
      const outputContent = FilesystemAccess.readJsonFile(p, true)

      // Assert
      expect(outputContent).toBeUndefined()
    })
  })

  describe('checkIfFileOrDirectoryExists', () => {
    it('checkIfFileOrDirectoryExists file exists', () => {
      // Arrange
      const p = 'dummy-file'
      checkIfFileOrDirectoryExistsSpy.and.callThrough()
      spyOn(fs, 'existsSync').and.returnValue(true)

      // Act
      const exists = FilesystemAccess.checkIfFileOrDirectoryExists(p)

      // Assert
      expect(exists).toEqual(true)
    })

    it('checkIfFileOrDirectoryExists file does not exist', () => {
      // Arrange
      const p = 'dummy-file'
      checkIfFileOrDirectoryExistsSpy.and.callThrough()
      spyOn(fs, 'existsSync').and.returnValue(false)

      // Act
      const exists = FilesystemAccess.checkIfFileOrDirectoryExists(p)

      // Assert
      expect(exists).toEqual(false)
    })
  })

  describe('chmod', () => {
    it('chmod works', () => {
      // Arrange
      const p = 'dummy-file'
      chmodSpy.and.callThrough()
      spyOn(fs, 'chmodSync').and.returnValue(undefined)

      // Act
      const result = FilesystemAccess.chmod(p, 0o400)

      // Assert
      expect(result).toBeUndefined()
    })
  })

  describe('writeIniFile', () => {
    it('writes an ini file (valid)', () => {
      // Arrange
      const p = 'dummy-file'
      const content = { subject: { key: 'value' } }
      writeFileSpy.and.returnValue(undefined)

      // Act
      const result = FilesystemAccess.writeIniFile(p, content)

      // Assert
      expect(result).toBeUndefined()
    })

    // it('writes an ini file (invalid)', () => {
    //   // Arrange
    //   const p = 'dummy-file'
    //   const content = ''
    //   writeFileSpy.and.returnValue(undefined)
    //
    //   // Act/Assert
    //   expect(() => FilesystemAccess.writeIniFile(p, content)).toThrow()
    // })
  })

  describe('readIniFile', () => {
    it('read an ini file (valid)', () => {
      // Arrange
      const p = 'dummy-file'
      const inputContent = '[DEFAULT]\n' +
        'ServerAliveInterval = 45'
      readFileSpy.and.returnValue(inputContent)

      // Act
      const outputContent = FilesystemAccess.readIniFile(p)

      // Assert
      expect(outputContent).toEqual({ DEFAULT: { ServerAliveInterval: '45' } })
    })

    it('read an ini file (invalid)', () => {
      // Arrange
      const p = 'dummy-file'
      const inputContent = null
      readFileSpy.and.returnValue(inputContent)

      // Act/Assert
      expect(() => FilesystemAccess.readIniFile(p)).toThrow()
    })
  })

  describe('readFile', () => {
    it('read a file', () => {
      // Arrange
      const p = 'dummy-file'
      const inputContent = 'dummy-content'
      readFileSpy.and.callThrough()
      spyOn(fs, 'readFileSync').and.returnValue(inputContent)

      // Act
      const outputContent = FilesystemAccess.readFile(p)

      // Assert
      expect(outputContent).toEqual(inputContent)
    })
  })

  describe('writeFile', () => {
    it('write a file', () => {
      // Arrange
      const p = 'dummy-file'
      const inputContent = 'dummy-content'
      writeFileSpy.and.callThrough()
      spyOn(fs, 'openSync').and.returnValue(undefined)
      spyOn(fs, 'writeFileSync').and.returnValue(undefined)
      spyOn(fs, 'closeSync').and.returnValue(undefined)

      // Act
      const result = FilesystemAccess.writeIniFile(p, inputContent)

      // Assert
      expect(result).toBeUndefined()
    })
  })

  describe('mkdir', () => {
    it('make a directory', () => {
      // Arrange
      const dir = 'dummy-dir'
      mkdirSpy.and.callThrough()
      spyOn(fs, 'mkdirSync').and.returnValue(undefined)

      // Act
      const result = FilesystemAccess.mkdir(dir)

      // Assert
      expect(result).toBeUndefined()
    })
  })
})
