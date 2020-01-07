import { UserUtil } from '../../src/utils/user-util'
import { VideoProgressDbGateway } from '../../src/gateway/video-progress-db-gateway'
import { CognitoAccess } from '../../src/access/aws/cognito-access'

describe('UserUtil', () => {
  describe('updateUserVideoProgress', () => {
    it('success', done => {
      // Arrange
      const projectName = 'dummy-project-name'
      const event = {
        directive: {
          payload: {
            videoProgress: {
              id: 'dummy-video-id',
              positionInMilliseconds: 123456,
              accessToken: 'dummy-access-token'
            }
          }
        }
      }
      const getUserIdfromAccessTokenSpy = spyOn(UserUtil, 'getUserIdfromAccessToken')
      getUserIdfromAccessTokenSpy.and.returnValue(Promise.resolve('dummy-user-id'))

      const updateVideoProgressSpy = spyOn(VideoProgressDbGateway, 'updateVideoProgress')
      updateVideoProgressSpy.and.returnValue(Promise.resolve(undefined))

      // Act
      const p = UserUtil.updateUserVideoProgress(event, projectName)

      // Assert
      p
        .then(result => {
          expect(result).toBeUndefined()
          expect(getUserIdfromAccessTokenSpy).toHaveBeenCalledTimes(1)
          expect(updateVideoProgressSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('no user id', done => {
      // Arrange
      const projectName = 'dummy-project-name'
      const event = {
        directive: {
          payload: {
            videoProgress: {
              id: 'dummy-video-id',
              positionInMilliseconds: 123456,
              accessToken: 'dummy-access-token'
            }
          }
        }
      }
      const getUserIdfromAccessTokenSpy = spyOn(UserUtil, 'getUserIdfromAccessToken')
      getUserIdfromAccessTokenSpy.and.returnValue(Promise.resolve(null))

      const updateVideoProgressSpy = spyOn(VideoProgressDbGateway, 'updateVideoProgress')
      updateVideoProgressSpy.and.returnValue(Promise.resolve(undefined))

      // Act
      const p = UserUtil.updateUserVideoProgress(event, projectName)

      // Assert
      p
        .then(result => {
          expect(result).toBeUndefined()
          expect(getUserIdfromAccessTokenSpy).toHaveBeenCalledTimes(1)
          expect(updateVideoProgressSpy).not.toHaveBeenCalled()
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })
  describe('getUserIdfromAccessToken', () => {
    it('success', done => {
      // Arrange
      const accessToken = 'dummy-access-token'
      const getUserSpy = spyOn(CognitoAccess, 'getUser')
      getUserSpy.and.returnValue(Promise.resolve({
        Username: 'dummy-user-id'
      }))

      // Act
      const p = UserUtil.getUserIdfromAccessToken(accessToken)

      // Assert
      p
        .then(result => {
          expect(result).toEqual('dummy-user-id')
          expect(getUserSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
    it('bad token', done => {
      // Arrange
      const accessToken = 'dummy-access-token'
      const getUserSpy = spyOn(CognitoAccess, 'getUser')
      getUserSpy.and.returnValue(Promise.resolve({}))

      // Act
      const p = UserUtil.getUserIdfromAccessToken(accessToken)

      // Assert
      p
        .then(result => {
          expect(result).toBeUndefined()
          expect(getUserSpy).toHaveBeenCalledTimes(1)
          done()
        })
        .catch(err => {
          done.fail(err)
        })
    })
  })
})
