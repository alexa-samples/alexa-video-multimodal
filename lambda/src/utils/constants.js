/**
 * An enum for Project level Constants
 */

export const Constants = {

  // Replace this with your own Catalog name to use your own Catalog
  CATALOG_NAME: 'ontv',

  // This can be up to 5 based on your Category database. It does not include the categories displayed inside 'More Categories'.
  NUM_CATEGORIES_ON_LANDING_PAGE: 3,

  // Response Directive Names
  GET_PLAYABLE_ITEMS_RESPONSE: 'GetPlayableItemsResponse',
  GET_PLAYABLE_ITEMS_METADATA_RESPONSE: 'GetPlayableItemsMetadataResponse',
  GET_NEXT_PAGE_RESPONSE: 'GetNextPageResponse',
  GET_DISPLAYABLE_ITEMS_RESPONSE: 'GetDisplayableItemsResponse',
  GET_DISPLAYABLE_ITEMS_METADATA_RESPONSE: 'GetDisplayableItemsMetadataResponse',
  GET_BROWSE_NODE_ITEMS_RESPONSE: 'GetBrowseNodeItemsResponse',
  ERROR_RESPONSE: 'ErrorResponse',
  DISCOVER_RESPONSE: 'Discover.Response',

  // Request Directive Names
  DISCOVER_REQUEST: 'Discover',
  GET_PLAYABLE_ITEMS_REQUEST: 'GetPlayableItems',
  GET_PLAYABLE_ITEMS_METADATA_REQUEST: 'GetPlayableItemsMetadata',
  GET_DISPLAYABLE_ITEMS_REQUEST: 'GetDisplayableItems',
  GET_DISPLAYABLE_ITEMS_METADATA_REQUEST: 'GetDisplayableItemsMetadata',
  GET_NEXT_PAGE_REQUEST: 'GetNextPage',
  GET_BROWSE_NODE_ITEMS_REQUEST: 'GetBrowseNodeItems',

  // Web Player Directive Names
  REFRESH_WEB_PLAYER_CREDENTIALS: 'RefreshWebPlayerCredentials',
  UPDATE_VIDEO_PROGRESS: 'UpdateVideoProgress',

  CONTENT_NOT_FOUND_TYPE: 'CONTENT_NOT_FOUND',
  CONTENT_NOT_FOUND_MESSAGE: 'optional information about the error that will be logged by Alexa',

  // The number of seconds that a next token record in DynamoDB should exist before expiring (2 hours)
  NEXT_TOKEN_TTL: 60 * 60 * 2,
  // The number of seconds that a video progress record in DynamoDB should exist before expiring (48 hours)
  VIDEO_PROGRESS_TTL: 60 * 60 * 48,

  VIDEO_CONTENT_S3_PREFIX: 'content',
  DEFAULT_SELF_SIGNED_S3_URL_EXPIRY_SECONDS: 60 * 60 * 8,
  ENABLE_WEB_PLAYER_LOGGING: 'ENABLE_WEB_PLAYER_LOGGING'
}
