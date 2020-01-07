import { AwsSdkUtil } from '../../../src/util/aws/aws-sdk-util'
import { of } from 'rxjs'
import { LambdaAccess } from '../../../src/access/aws/lambda-access'

describe('LambdaAccess', () => {
  it('updateFunctionCode', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))
    const functionName = 'dummy-function-name'
    const s3Bucket = 'dummy-s3-bucket'
    const s3Key = 'dummy-s3-key'

    // Act
    const o = LambdaAccess.updateFunctionCode(functionName, s3Bucket, s3Key)

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  describe('getFunction', () => {
    it('success', (done) => {
      // Arrange
      const expectedResults = {}
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = LambdaAccess.getFunction('dummy-lambda-function-name')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(expectedResults)
        done()
      })
    })
  })

  describe('checkIfLambdaFunctionExists', () => {
    it('lambda function exists', (done) => {
      // Arrange
      const expectedResults = {}
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = LambdaAccess.checkIfLambdaFunctionExists('dummy-lambda-function-name')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(true)
        done()
      })
    })

    it('lambda function does not exist', (done) => {
      // Arrange
      const expectedResults = null
      spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

      // Act
      const o = LambdaAccess.checkIfLambdaFunctionExists('dummy-lambda-function-name')

      // Assert
      o.subscribe(results => {
        expect(results).toEqual(false)
        done()
      })
    })
  })

  it('addPermission', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = LambdaAccess.addPermission(
      'dummy-lambda-function-name',
      'dummy-action',
      'dummy-principal',
      'dummy-statement-id',
      'dummy-event-source-token')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('getFunctionConfiguration', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = LambdaAccess.getFunctionConfiguration('dummy-lambda-function-name')

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('updateFunctionConfiguration', (done) => {
    // Arrange
    const expectedResults = {}
    spyOn(AwsSdkUtil, 'makeRequest').and.returnValue(of(expectedResults))

    // Act
    const o = LambdaAccess.updateFunctionConfiguration('dummy-lambda-function-name', {})

    // Assert
    o.subscribe(results => {
      expect(results).toEqual(expectedResults)
      done()
    })
  })

  it('updateLambdaEnvironmentVariables', (done) => {
    // Arrange
    const getFunctionConfigurationSpy = spyOn(LambdaAccess, 'getFunctionConfiguration')
    getFunctionConfigurationSpy.and.returnValue(of({
      Environment: {
        Variables: {}
      }
    }))
    const updateFunctionConfigurationSpy = spyOn(LambdaAccess, 'updateFunctionConfiguration')
    updateFunctionConfigurationSpy.and.returnValue(of({}))

    // Act
    const o = LambdaAccess.updateLambdaEnvironmentVariables('dummy-lambda-function-name', {
      'dummy-env-var-name': 'dummy-env-var-value'
    })

    // Assert
    o.subscribe(results => {
      expect(results).toEqual({})
      expect(getFunctionConfigurationSpy).toHaveBeenCalledTimes(1)
      expect(updateFunctionConfigurationSpy).toHaveBeenCalledTimes(1)
      done()
    })
  })
})
