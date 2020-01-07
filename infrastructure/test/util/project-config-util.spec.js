import { ProjectConfigUtil } from '../../src/util/project-config-util'
import { FilesystemAccess } from '../../src/access/filesystem-access'
import { checkIfFileOrDirectoryExistsSpy, chmodSpy, readFileSpy, touchSpy, writeFileSpy } from '../run'
import { Util } from '../../src/util/util'
import { of } from 'rxjs'

describe('ProjectConfigUtil', () => {
  describe('readProjectConfig', () => {
    it('config file exists', () => {
      // Arrange
      const config = {
        projectName: null,
        projectRoot: null,
        askSecurityProfileClientId: null,
        askSecurityProfileClientSecret: null,
        skillName: null,
        country: null,
        locales: []

      }
      checkIfFileOrDirectoryExistsSpy.and.returnValue(true)
      readFileSpy.and.returnValue(JSON.stringify(config))

      // Act
      const returnedConfig = ProjectConfigUtil.readProjectConfig()

      // Assert
      expect(config).toEqual(returnedConfig)
    })

    it('config file does not exist', () => {
      // Arrange
      const config = {
        projectName: null,
        projectRoot: null,
        askSecurityProfileClientId: null,
        askSecurityProfileClientSecret: null,
        skillName: null,
        country: null,
        locales: []

      }
      checkIfFileOrDirectoryExistsSpy.and.returnValue(false)
      readFileSpy.and.returnValue(JSON.stringify(config))

      // Act
      const returnedConfig = ProjectConfigUtil.readProjectConfig()

      // Assert
      expect(config).toEqual(returnedConfig)
    })
  })

  describe('persistProjectConfig', () => {
    it('success (config exists)', () => {
      // Arrange
      const config = {
        projectName: 'dummy-project-name',
        projectRoot: 'dummy-project-root',
        askSecurityProfileClientId: 'dummy-client-id',
        askSecurityProfileClientSecret: 'dummy-secret',
        skillName: 'dummy-skill-name',
        country: 'dummy-country',
        locales: []

      }
      checkIfFileOrDirectoryExistsSpy.and.returnValue(true)
      readFileSpy.and.returnValue(JSON.stringify(config))
      writeFileSpy.and.returnValue(null)
      chmodSpy.and.returnValue(null)

      // Act
      const returnedConfig = ProjectConfigUtil.persistProjectConfig(config)

      // Assert
      expect(config).toEqual(returnedConfig)
    })

    it('success (config does not exist)', () => {
      // Arrange
      const config = {
        projectName: 'dummy-project-name',
        projectRoot: 'dummy-project-root',
        askSecurityProfileClientId: 'dummy-client-id',
        askSecurityProfileClientSecret: 'dummy-secret',
        skillName: 'dummy-skill-name'

      }
      checkIfFileOrDirectoryExistsSpy.and.returnValue(false)
      touchSpy.and.callFake(() => {
      })
      writeFileSpy.and.returnValue(null)
      chmodSpy.and.returnValue(null)

      // Act
      const returnedConfig = ProjectConfigUtil.persistProjectConfig(config)

      // Assert
      expect(config).toEqual(returnedConfig)
      expect(FilesystemAccess.touch).toHaveBeenCalled()
    })
  })

  describe('promptForProjectConfigs', () => {
    it('success', () => {
      // Arrange
      const config = {
        projectName: 'dummy-project-name',
        projectRoot: 'dummy-project-root',
        askSecurityProfileClientId: 'dummy-client-id',
        askSecurityProfileClientSecret: 'dummy-secret',
        skillName: 'dummy-skill-name'

      }
      spyOn(ProjectConfigUtil, 'getProjectConfig').and.returnValue(config)
      spyOn(Util, 'doPrompt').and.returnValue(of(config))

      // Act
      const o = ProjectConfigUtil.promptForProjectConfigs()

      // Assert
      o.subscribe(returnedConfig => {
        expect(config).toEqual(returnedConfig)
      })
    })
  })

  describe('requiresProjectConfigPrompts', () => {
    it('not required', () => {
      // Arrange
      const config = {
        projectName: 'dummy-project-name',
        projectRoot: 'dummy-project-root',
        askSecurityProfileClientId: 'dummy-client-id',
        askSecurityProfileClientSecret: 'dummy-secret',
        skillName: 'dummy-skill-name',
        country: 'dummy-country',
        locales: ['dummy-locale']

      }
      spyOn(ProjectConfigUtil, 'readProjectConfig').and.returnValue(config)

      // Act
      const o = ProjectConfigUtil.requiresProjectConfigPrompts()

      // Assert
      o.subscribe(isRequired => {
        expect(isRequired).toEqual(false)
      })
    })

    it('required - missing config', () => {
      // Arrange
      const config = {
        projectName: null,
        projectRoot: 'dummy-project-root',
        askSecurityProfileClientId: 'dummy-client-id',
        askSecurityProfileClientSecret: 'dummy-secret',
        skillName: 'dummy-skill-name'

      }
      spyOn(ProjectConfigUtil, 'readProjectConfig').and.returnValue(config)

      // Act
      const o = ProjectConfigUtil.requiresProjectConfigPrompts()

      // Assert
      o.subscribe(isRequired => {
        expect(isRequired).toEqual(true)
      })
    })
  })
})
