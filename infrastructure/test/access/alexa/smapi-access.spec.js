import { Util } from '../../../src/util/util'
import { of } from 'rxjs'
import { SmapiAccess } from '../../../src/access/alexa/smapi-access'
import 'jasmine'

describe('SmapiAccess', () => {
  describe('getSkillManifest', () => {
    it('getSkillManifest success', () => {
      // Arrange
      const httpResponse = JSON.stringify({ manifest: {} })
      spyOn(Util, 'submitHttpRequest').and.returnValue(of(httpResponse))

      // Act
      const o = SmapiAccess.getSkillManifest('dummy-skill-id', 'dummy-skill-stage', 'dummy-access-token')

      // Assert
      o.subscribe(manifest => {
        expect(manifest).toEqual({ manifest: {} })
      })
    })

    it('getSkillManifest error', () => {
      // Arrange
      const httpResponse = 'junk-json'
      spyOn(Util, 'submitHttpRequest').and.returnValue(of(httpResponse))
      spyOn(Util, 'exitWithError').and.returnValue(undefined)

      // Act
      const o = SmapiAccess.getSkillManifest('dummy-skill-id', 'dummy-skill-stage', 'dummy-access-token')

      // Assert
      o.subscribe(manifest => {
        expect(manifest).toBeUndefined()
        expect(Util.exitWithError).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Object))
      })
    })
  })

  describe('updateSkillManifest', () => {
    it('updateSkillManifest success', () => {
      // Arrange
      spyOn(Util, 'submitHttpRequest').and.returnValue(of(undefined))

      // Act
      const o = SmapiAccess.updateSkillManifest('dummy-skill-id', 'dummy-skill-stage', {}, 'dummy-access-token')

      // Assert
      o.subscribe(manifest => {
        expect(manifest).toEqual(undefined)
      })
    })
  })

  describe('getSkillStage', () => {
    it('getSkillStage success', () => {
      // Arrange
      const httpResponse = JSON.stringify({ skills: [{ stage: 'dummy-stage' }] })
      spyOn(Util, 'submitHttpRequest').and.returnValue(of(httpResponse))

      // Act
      const o = SmapiAccess.getSkillStage('dummy-vendor-id', 'dummy-skill-id', 'dummy-access-token')

      // Assert
      o.subscribe(stage => {
        expect(stage).toEqual('dummy-stage')
      })
    })

    it('getSkillStage error - skill not found', () => {
      // Arrange
      const httpResponse = JSON.stringify({ skills: [] })
      spyOn(Util, 'submitHttpRequest').and.returnValue(of(httpResponse))
      spyOn(Util, 'exitWithError').and.returnValue(undefined)

      // Act
      const o = SmapiAccess.getSkillStage('dummy-vendor-id', 'dummy-skill-id', 'dummy-access-token')

      // Assert
      o.subscribe(stage => {
        expect(stage).toBeUndefined()
        expect(Util.exitWithError).toHaveBeenCalledWith(jasmine.any(String))
      })
    })

    it('getSkillStage error - invalid json', () => {
      // Arrange
      const httpResponse = 'junk-json'
      spyOn(Util, 'submitHttpRequest').and.returnValue(of(httpResponse))
      spyOn(Util, 'exitWithError').and.returnValue(undefined)

      // Act
      const o = SmapiAccess.getSkillStage('dummy-vendor-id', 'dummy-skill-id', 'dummy-access-token')

      // Assert
      o.subscribe(stage => {
        expect(stage).toBeUndefined()
        expect(Util.exitWithError).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Object))
      })
    })
  })

  it('configureSkillAccountLinking', () => {
    // Arrange
    const httpResponse = 'dummy-response'
    spyOn(Util, 'submitHttpRequest').and.returnValue(of(httpResponse))

    // Act
    const o = SmapiAccess.configureSkillAccountLinking('dummy-skill-id', 'dummy-skill-stage', 'dummy-authorization-uri', 'dummy-access-token-uri', 'dummy-client-id', 'dummy-client-secret', 'dummy-access-token')

    // Assert
    o.subscribe(response => {
      expect(response).toEqual('dummy-response')
    })
  })

  it('createSkill', () => {
    // Arrange
    const httpResponse = { skillId: 'dummy-skill-id' }
    spyOn(Util, 'submitHttpRequest').and.returnValue(of(httpResponse))

    // Act
    const o = SmapiAccess.createSkill('dummy-vendor-id', {}, 'dummy-access-token')

    // Assert
    o.subscribe(skillId => {
      expect(skillId).toEqual('dummy-skill-id')
    })
  })

  it('checkSkillStatus', () => {
    // Arrange
    const httpResponse = {
      manifest: {
        lastUpdateRequest: {
          status: 'dummy-status'
        }
      }
    }
    spyOn(Util, 'submitHttpRequest').and.returnValue(of(JSON.stringify(httpResponse)))

    // Act
    const o = SmapiAccess.checkSkillStatus('dummy-skill-id', 'dummy-access-token')

    // Assert
    o.subscribe(status => {
      expect(status).toEqual('dummy-status')
    })
  })

  describe('createSkillAndWait', () => {
    it('SUCCEEDED', done => {
      // Arrange
      spyOn(SmapiAccess, 'createSkill').and.returnValue(of('dummy-skill-id'))
      spyOn(SmapiAccess, 'checkSkillStatus').and.returnValue(of('SUCCEEDED'))
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')

      // Act
      const o = SmapiAccess.createSkillAndWait('dummy-vendor-id', {}, 'dummy-access-token')

      // Assert
      o.subscribe(skillId => {
        expect(skillId).toEqual('dummy-skill-id')
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })

    it('IN_PROGRESS/SUCCEEDED', done => {
      // Arrange
      spyOn(SmapiAccess, 'createSkill').and.returnValue(of('dummy-skill-id'))
      spyOn(SmapiAccess, 'checkSkillStatus').and.returnValues(of('IN_PROGRESS'), of('SUCCEEDED'))
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')

      // Act
      const o = SmapiAccess.createSkillAndWait('dummy-vendor-id', {}, 'dummy-access-token')

      // Assert
      o.subscribe(skillId => {
        expect(skillId).toEqual('dummy-skill-id')
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
  })

  describe('updateSkillAndWait', () => {
    it('SUCCEEDED', done => {
      // Arrange
      spyOn(SmapiAccess, 'updateSkillManifest').and.returnValue(of(null))
      spyOn(SmapiAccess, 'checkSkillStatus').and.returnValue(of('SUCCEEDED'))
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')

      // Act
      const o = SmapiAccess.updateSkillAndWait('dummy-vendor-id', {}, 'dummy-access-token')

      // Assert
      o.subscribe(response => {
        expect(response).toEqual('SUCCEEDED')
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })

    it('IN_PROGRESS/SUCCEEDED', done => {
      // Arrange
      spyOn(SmapiAccess, 'updateSkillManifest').and.returnValue(of(null))
      spyOn(SmapiAccess, 'checkSkillStatus').and.returnValues(of('IN_PROGRESS'), of('SUCCEEDED'))
      const exitWithErrorSpy = spyOn(Util, 'exitWithError')

      // Act
      const o = SmapiAccess.updateSkillAndWait('dummy-vendor-id', {}, 'dummy-access-token')

      // Assert
      o.subscribe(response => {
        expect(response).toEqual('SUCCEEDED')
        expect(exitWithErrorSpy).not.toHaveBeenCalled()
        done()
      })
    })
  })

  it('deleteSkill', () => {
    // Arrange
    const httpResponse = {}
    spyOn(Util, 'submitHttpRequest').and.returnValue(of(httpResponse))

    // Act
    const o = SmapiAccess.deleteSkill('dummy-skill-id', 'dummy-access-token')

    // Assert
    o.subscribe(response => {
      expect(response).toEqual({})
    })
  })
})
