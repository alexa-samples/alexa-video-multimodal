import { Util } from '../../src/utils/util'
import { DatabaseGateway } from '../../src/gateway/database-gateway'
import { DiscoverHandler } from '../../src/handlers/discover-response-handler'
import { CapabilitiesEndpoint } from '../../src/models/database-models/capabilities-endpoint'

describe('DiscoverHandler', () => {
  describe('getDiscoverResponseBuilder', () => {
    it('Success', () => {
      // Arrange
      const event =
        {
          directive: {
            header: {
              namespace: 'Alexa.Discovery',
              name: 'Discover',
              payloadVersion: '3',
              messageId: 'cc9c6adf-13b3-4a96-8b1c-5abff98c0dbe'
            },
            payload: {
              scope: {
                type: 'BearerToken',
                token: 'eyJraWQiOiJjdWRHeVVkamk1SzdLT'
              }
            }
          }
        }

      const getSkillCapabilitiesSpy = spyOn(DatabaseGateway, 'getSkillCapabilities')
      getSkillCapabilitiesSpy.and.returnValue([new CapabilitiesEndpoint(
        {
          endpointId: 'sample-endpoint-id',
          endpointTypeId: 'sample-endpoint-type-id',
          manufacturerName: 'sample-manufacturer-name',
          capabilities: [
            {
              type: 'sample-type',
              interface: 'sample-interface',
              version: '1.0'
            }]
        })]
      )

      const generateNextTokenSpy = spyOn(Util, 'generateNextToken')
      generateNextTokenSpy.and.returnValue(null)

      const generateMessageIdSpy = spyOn(Util, 'generateMessageId')
      generateMessageIdSpy.and.returnValue(null)

      const expectedResults =
        {
          payload: {
            endpoints: [{
              endpointId: 'sample-endpoint-id',
              endpointTypeId: 'sample-endpoint-type-id',
              manufacturerName: 'sample-manufacturer-name'
            }]
          }
        }

      // Act
      const result = DiscoverHandler.getDiscoverResponseBuilder(event)

      // Assert
      expect(result).toBeTruthy()
      expect(result.payload).toBeTruthy()
      expect(result.payload.endpoints[0].endpointId).toEqual(expectedResults.payload.endpoints[0].endpointId)
    })
  })
})
