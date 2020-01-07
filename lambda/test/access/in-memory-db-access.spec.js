import * as Database from '../../src/database/database'
import { InMemoryDatabaseAccess } from '../../src/access/in-memmory-db-access'

describe('InMemoryDatabaseAccess', () => {
  beforeEach(() => {
    Database.videoDatabase = []
    Database.categoryDatabase = []
  })

  afterEach(() => {
    Database.videoDatabase = []
    Database.categoryDatabase = []
  })

  describe('searchDatabaseByVideoName', () => {
    it('exact match', () => {
      // Arrange
      const videoName = 'dummy-video-name-1'
      Database.videoDatabase = [
        {
          name: 'dummy-video-name-0',
          id: 'dummy-video-id-0'
        },
        {
          name: 'dummy-video-name-1',
          id: 'dummy-video-id-1'
        }
      ]

      const expectedResults = ['dummy-video-id-1']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByVideoName(videoName)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('case insensitive match', () => {
      // Arrange
      const videoName = 'dummy-video-name-1'
      Database.videoDatabase = [
        {
          name: 'dummy-video-name-0',
          id: 'dummy-video-id-0'
        },
        {
          name: 'dummy-video-name-1',
          id: 'dummy-video-id-1'
        },
        {
          name: 'DUMMY-VIDEO-NAME-1',
          id: 'dummy-video-id-2'
        }
      ]

      const expectedResults = ['dummy-video-id-1', 'dummy-video-id-2']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByVideoName(videoName)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('no match', () => {
      // Arrange
      const videoName = 'dummy-video-name-5'
      Database.videoDatabase = [
        {
          name: 'dummy-video-name-0',
          id: 'dummy-video-id-0'
        },
        {
          name: 'dummy-video-name-1',
          id: 'dummy-video-id-1'
        },
        {
          name: 'DUMMY-VIDEO-NAME-1',
          id: 'dummy-video-id-2'
        }
      ]

      const expectedResults = []

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByVideoName(videoName)

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('searchDatabaseByGenreName', () => {
    it('exact match', () => {
      // Arrange
      const genreName = 'dummy-genre-0'
      Database.videoDatabase = [
        {
          genre: ['dummy-genre-0'],
          id: 'dummy-video-id-0'
        },
        {
          genre: ['dummy-genre-1'],
          id: 'dummy-video-id-1'
        },
        {
          genre: ['dummy-genre-0'],
          id: 'dummy-video-id-2'
        }
      ]

      const expectedResults = ['dummy-video-id-0', 'dummy-video-id-2']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByGenreName(genreName)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('case insensitive match', () => {
      // Arrange
      const genreName = 'dummy-genre-0'
      Database.videoDatabase = [
        {
          genre: ['dummy-genre-0'],
          id: 'dummy-video-id-0'
        },
        {
          genre: ['dummy-genre-1'],
          id: 'dummy-video-id-1'
        },
        {
          genre: ['DUMMY-GENRE-0'],
          id: 'dummy-video-id-2'
        }
      ]

      const expectedResults = ['dummy-video-id-0', 'dummy-video-id-2']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByGenreName(genreName)

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('searchDatabaseByActorName', () => {
    it('exact match', () => {
      // Arrange
      const actorName = 'dummy-actor-0'
      Database.videoDatabase = [
        {
          actors: ['dummy-actor-0'],
          id: 'dummy-video-id-0'
        },
        {
          actors: ['dummy-actor-1'],
          id: 'dummy-video-id-1'
        },
        {
          actors: ['dummy-actor-0'],
          id: 'dummy-video-id-2'
        }
      ]

      const expectedResults = ['dummy-video-id-0', 'dummy-video-id-2']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByActorName(actorName)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('case insensitive match', () => {
      // Arrange
      const actorName = 'dummy-actor-0'
      Database.videoDatabase = [
        {
          actors: ['dummy-actor-0'],
          id: 'dummy-video-id-0'
        },
        {
          actors: ['dummy-actor-1'],
          id: 'dummy-video-id-1'
        },
        {
          actors: ['DUMMY-ACTOR-0'],
          id: 'dummy-video-id-2'
        }
      ]

      const expectedResults = ['dummy-video-id-0', 'dummy-video-id-2']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByActorName(actorName)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('no match', () => {
      // Arrange
      const actorName = 'dummy-actor-5'
      Database.videoDatabase = [
        {
          actors: ['dummy-actor-0'],
          id: 'dummy-video-id-0'
        },
        {
          actors: ['dummy-actor-1'],
          id: 'dummy-video-id-1'
        },
        {
          actors: ['DUMMY-ACTOR-0'],
          id: 'dummy-video-id-2'
        }
      ]

      const expectedResults = []

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByActorName(actorName)

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('searchDatabaseByVideoId', () => {
    it('match found', () => {
      // Arrange
      const videoId = 'dummy-video-id-1'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-0'
        },
        {
          id: 'dummy-video-id-1'
        },
        {
          id: 'dummy-video-id-2'
        }
      ]

      const expectedResults = ['dummy-video-id-1']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByVideoId(videoId)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('no match', () => {
      // Arrange
      const videoId = 'dummy-video-id-5'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-0'
        },
        {
          id: 'dummy-video-id-1'
        },
        {
          id: 'dummy-video-id-2'
        }
      ]

      const expectedResults = []

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByVideoId(videoId)

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('searchDatabaseByChannelCallSign', () => {
    it('exact match', () => {
      // Arrange
      const channelCallSign = 'PBS'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-0',
          networkDetails: { callSign: 'PBS' }
        },
        {
          id: 'dummy-video-id-1',
          networkDetails: { callSign: 'NBC' }
        }
      ]

      const expectedResults = ['dummy-video-id-0']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByChannelCallSign(channelCallSign)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('case insensitive match', () => {
      // Arrange
      const channelCallSign = 'PBS'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-0',
          networkDetails: { callSign: 'pbs' }
        },
        {
          id: 'dummy-video-id-1',
          networkDetails: { callSign: 'NBC' }
        }
      ]

      const expectedResults = ['dummy-video-id-0']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByChannelCallSign(channelCallSign)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('no match', () => {
      // Arrange
      const channelCallSign = 'CBS'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-0',
          networkDetails: { callSign: 'pbs' }
        },
        {
          id: 'dummy-video-id-1',
          networkDetails: { callSign: 'NBC' }
        }
      ]

      const expectedResults = []

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByChannelCallSign(channelCallSign)

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('searchDatabaseBySeasonAndEpisode', () => {
    it('match found', () => {
      // Arrange
      const videoId = 'dummy-video-id'
      const searchSeasonNumber = '1'
      const searchEpisodeNumber = '2'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'dummy-video-name-1',
          seasonNumber: '1',
          episodeNumber: '1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'dummy-video-name-1',
          seasonNumber: '1',
          episodeNumber: '2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'dummy-video-name-1',
          seasonNumber: '1',
          episodeNumber: '3'
        }
      ]

      const expectedResults = ['dummy-video-id-2']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseBySeasonAndEpisode(videoId, searchSeasonNumber, searchEpisodeNumber)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('case insensitive video id match', () => {
      // Arrange
      const videoId = 'DUMMY-VIDEO-id'
      const searchSeasonNumber = '1'
      const searchEpisodeNumber = '2'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '3'
        }
      ]

      const expectedResults = ['dummy-video-id-2']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseBySeasonAndEpisode(videoId, searchSeasonNumber, searchEpisodeNumber)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('no match - episode number', () => {
      // Arrange
      const videoId = 'dummy-video-id'
      const searchSeasonNumber = '1'
      const searchEpisodeNumber = '5'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '3'
        }
      ]

      const expectedResults = []

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseBySeasonAndEpisode(videoId, searchSeasonNumber, searchEpisodeNumber)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('no match - season number', () => {
      // Arrange
      const videoId = 'dummy-video-id'
      const searchSeasonNumber = '2'
      const searchEpisodeNumber = '1'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '3'
        }
      ]

      const expectedResults = []

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseBySeasonAndEpisode(videoId, searchSeasonNumber, searchEpisodeNumber)

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('searchDatabaseBySeason', () => {
    it('exact match', () => {
      // Arrange
      const videoId = 'dummy-video-id'
      const searchSeasonNumber = '1'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'dummy-video-name-1',
          seasonNumber: '1',
          episodeNumber: '1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'dummy-video-name-1',
          seasonNumber: '1',
          episodeNumber: '2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'dummy-video-name-1',
          seasonNumber: '1',
          episodeNumber: '3'
        }
      ]

      const expectedResults = ['dummy-video-id-1', 'dummy-video-id-2', 'dummy-video-id-3']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseBySeason(videoId, searchSeasonNumber)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('case insensitive match', () => {
      // Arrange
      const videoId = 'DUMMY-VIDEO-id'
      const searchSeasonNumber = '1'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '3'
        }
      ]

      const expectedResults = ['dummy-video-id-1', 'dummy-video-id-2', 'dummy-video-id-3']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseBySeason(videoId, searchSeasonNumber)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('no match - season number', () => {
      // Arrange
      const videoId = 'dummy-video-id'
      const searchSeasonNumber = '2'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'DUMMY-VIDEO-NAME-1',
          seasonNumber: '1',
          episodeNumber: '3'
        }
      ]

      const expectedResults = []

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseBySeason(videoId, searchSeasonNumber)

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('searchDatabaseByIdForVideoMetadata', () => {
    it('match found', () => {
      // Arrange
      const videoId = 'dummy-video-id-3'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'dummy-video-name-1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'dummy-video-name-2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'dummy-video-name-3'
        }
      ]

      // Act
      const result = InMemoryDatabaseAccess.searchDatabaseByIdForVideoMetadata(videoId)

      // Assert
      expect(result).toBeTruthy()
      expect(result.name).toBeTruthy()
      expect(result.name).toEqual('dummy-video-name-3')
    })

    it('no match', () => {
      // Arrange
      const videoId = 'dummy-video-id-5'
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'dummy-video-name-1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'dummy-video-name-2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'dummy-video-name-3'
        }
      ]

      // Act
      const result = InMemoryDatabaseAccess.searchDatabaseByIdForVideoMetadata(videoId)

      // Assert
      expect(result).toEqual(null)
    })
  })

  describe('searchDatabaseByIdsForVideoMetadata', () => {
    it('match found', () => {
      // Arrange
      const videoIds = ['dummy-video-id-3']
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'dummy-video-name-1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'dummy-video-name-2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'dummy-video-name-3'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByIdsForVideoMetadata(videoIds)

      // Assert
      expect(results).toBeTruthy()
      expect(results[0].name).toBeTruthy()
      expect(results[0].name).toEqual('dummy-video-name-3')
    })

    it('no match', () => {
      // Arrange
      const videoIds = ['dummy-video-id-5']
      Database.videoDatabase = [
        {
          id: 'dummy-video-id-1',
          name: 'dummy-video-name-1'
        },
        {
          id: 'dummy-video-id-2',
          name: 'dummy-video-name-2'
        },
        {
          id: 'dummy-video-id-3',
          name: 'dummy-video-name-3'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByIdsForVideoMetadata(videoIds)

      // Assert
      expect(results).toEqual([])
    })
  })

  describe('searchDatabaseByCategory', () => {
    it('match found', () => {
      // Arrange
      const categoryId = ['dummy-category-id-3']
      Database.categoryDatabase = [
        {
          id: 'dummy-category-id-1',
          name: 'dummy-category-name-1'
        },
        {
          id: 'dummy-category-id-2',
          name: 'dummy-category-name-2'
        },
        {
          id: 'dummy-category-id-3',
          name: 'dummy-category-name-3'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByCategory(categoryId)

      // Assert
      expect(results).toBeTruthy()
      expect(results[0].name).toBeTruthy()
      expect(results[0].name).toEqual('dummy-category-name-3')
    })

    it('match found', () => {
      // Arrange
      const categoryId = ['dummy-category-id-5']
      Database.categoryDatabase = [
        {
          id: 'dummy-category-id-1',
          name: 'dummy-category-name-1'
        },
        {
          id: 'dummy-category-id-2',
          name: 'dummy-category-name-2'
        },
        {
          id: 'dummy-category-id-3',
          name: 'dummy-category-name-3'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseByCategory(categoryId)

      // Assert
      expect(results).toEqual([])
    })
  })

  describe('searchDatabaseForAllCategoryIds', () => {
    it('match found', () => {
      // Arrange
      Database.categoryDatabase = [
        {
          id: 'dummy-category-id-1',
          name: 'dummy-category-name-1'
        },
        {
          id: 'dummy-category-id-2',
          name: 'dummy-category-name-2'
        },
        {
          id: 'dummy-category-id-3',
          name: 'dummy-category-name-3'
        }
      ]

      const expectedResults = ['dummy-category-id-1', 'dummy-category-id-2', 'dummy-category-id-3']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseForAllCategoryIds()

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('searchDatabaseForVideoIdsByCategory', () => {
    it('match found', () => {
      const categoryId = 'dummy-category-id-3'
      // Arrange
      Database.categoryDatabase = [
        {
          id: 'dummy-category-id-1',
          name: 'dummy-category-name-1'
        },
        {
          id: 'dummy-category-id-2',
          name: 'dummy-category-name-2'
        },
        {
          id: 'dummy-category-id-3',
          name: 'dummy-category-name-3'
        }
      ]

      Database.videoDatabase = [
        {
          genre: ['dummy-category-name-2'],
          id: 'dummy-video-id-2'
        },
        {
          genre: ['dummy-category-name-3'],
          id: 'dummy-video-id-3'
        }
      ]

      const expectedResults = ['dummy-video-id-3']

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseForVideoIdsByCategory(categoryId)

      // Assert
      expect(results).toEqual(expectedResults)
    })

    it('no match', () => {
      const categoryId = 'dummy-category-id-5'
      // Arrange
      Database.categoryDatabase = [
        {
          id: 'dummy-category-id-1',
          name: 'dummy-category-name-1'
        },
        {
          id: 'dummy-category-id-2',
          name: 'dummy-category-name-2'
        },
        {
          id: 'dummy-category-id-3',
          name: 'dummy-category-name-3'
        }
      ]

      Database.videoDatabase = [
        {
          genre: ['dummy-category-name-2'],
          id: 'dummy-video-id-2'
        },
        {
          genre: ['dummy-category-name-3'],
          id: 'dummy-video-id-3'
        }
      ]

      const expectedResults = []

      // Act
      const results = InMemoryDatabaseAccess.searchDatabaseForVideoIdsByCategory(categoryId)

      // Assert
      expect(results).toEqual(expectedResults)
    })
  })

  describe('getAvailableSeasons', () => {
    it('successs', () => {
      // Arrange
      Database.videoDatabase = [
        {
          id: 'dummy-idS0E0',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS0E1',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '1'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-0',
          seasonNumber: '1',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-1',
          seasonNumber: '1',
          episodeNumber: '0'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.getAvailableSeasons('dummy-id')

      // Assert
      expect(results).toEqual([0, 1])
    })
  })

  describe('getPreviousEpisodeVideoMetadataBySeason', () => {
    it('successs', () => {
      // Arrange
      Database.videoDatabase = [
        {
          id: 'dummy-idS0E0',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS0E1',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '1'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-0',
          seasonNumber: '1',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-1',
          seasonNumber: '1',
          episodeNumber: '0'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.getPreviousEpisodeVideoMetadataBySeason('dummy-id', 0, 99)

      // Assert
      expect(results).toEqual(
        {
          id: 'dummy-idS0E1',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '1'
        }
      )
    })
    it('filtered', () => {
      // Arrange
      Database.videoDatabase = [
        {
          id: 'dummy-idS0E0',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS0E1',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '1'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-0',
          seasonNumber: '1',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-1',
          seasonNumber: '1',
          episodeNumber: '0'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.getPreviousEpisodeVideoMetadataBySeason('dummy-id', 0, 1)

      // Assert
      expect(results).toEqual(
        {
          id: 'dummy-idS0E0',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '0'
        }
      )
    })
    it('not found', () => {
      // Arrange
      Database.videoDatabase = [
        {
          id: 'dummy-idS0E0',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS0E1',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '1'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-0',
          seasonNumber: '1',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-1',
          seasonNumber: '1',
          episodeNumber: '0'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.getPreviousEpisodeVideoMetadataBySeason('dummy-id', 3, 1)

      // Assert
      expect(results).toBeNull()
    })
  })
  describe('getNextEpisodeVideoMetadataBySeason', () => {
    it('successs', () => {
      // Arrange
      Database.videoDatabase = [
        {
          id: 'dummy-idS0E0',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS0E1',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '1'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-0',
          seasonNumber: '1',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-1',
          seasonNumber: '1',
          episodeNumber: '0'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.getNextEpisodeVideoMetadataBySeason('dummy-id', 0, -1)

      // Assert
      expect(results).toEqual(
        {
          id: 'dummy-idS0E0',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '0'
        }
      )
    })
    it('filtered', () => {
      // Arrange
      Database.videoDatabase = [
        {
          id: 'dummy-idS0E0',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS0E1',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '1'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-0',
          seasonNumber: '1',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-1',
          seasonNumber: '1',
          episodeNumber: '0'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.getNextEpisodeVideoMetadataBySeason('dummy-id', 0, 0)

      // Assert
      expect(results).toEqual(
        {
          id: 'dummy-idS0E1',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '1'
        }
      )
    })
    it('not found', () => {
      // Arrange
      Database.videoDatabase = [
        {
          id: 'dummy-idS0E0',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS0E1',
          name: 'dummy-name-0',
          seasonNumber: '0',
          episodeNumber: '1'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-0',
          seasonNumber: '1',
          episodeNumber: '0'
        },
        {
          id: 'dummy-idS1E0',
          name: 'dummy-name-1',
          seasonNumber: '1',
          episodeNumber: '0'
        }
      ]

      // Act
      const results = InMemoryDatabaseAccess.getNextEpisodeVideoMetadataBySeason('dummy-id', 0, 9999)

      // Assert
      expect(results).toBeNull()
    })
  })
})
