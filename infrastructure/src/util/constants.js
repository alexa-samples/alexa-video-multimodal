/**
 * Constants
 */
export const Constants = {
  DEMO_CONTENT_BASE_URL: 'https://d2dut6wnkosx6f.cloudfront.net/content/',
  DEMO_CONTENT_PATHS: [
    {
      FOLDER: 'big-buck-bunny',
      VIDEO: 'Bug.Buck.Bunny.mp4',
      THUMBNAIL: 'Big.Buck.Bunny.thumbnail.png',
      CC_FILE: null
    },
    {
      FOLDER: 'elephants-dream',
      VIDEO: 'Elephants.Dream.mp4',
      THUMBNAIL: 'Elephants.Dream.thumbnail.jpg',
      CC_FILE: 'Elephants.Dream.cc.vtt'
    }
  ],
  SKILL_ID_AWS_TAG_KEY: 'ReferenceSoftwareSkillId',
  NA_REGION: 'us-east-1',
  EU_REGION: 'eu-west-1',
  FE_REGION: 'us-west-2',
  ENABLE_WEB_PLAYER_LOGGING: 'ENABLE_WEB_PLAYER_LOGGING',
  SUPPORTED_COUNTRIES: {
    DE: 'Germany',
    AU: 'Australia',
    IN: 'India',
    JP: 'Japan',
    GB: 'Great Britain',
    IT: 'Italy',
    MX: 'Mexico',
    FR: 'France',
    US: 'United States',
    CA: 'Canada',
    ES: 'Spain'
  },
  SUPPORTED_LOCALES: {
    'de-DE': 'German: de-DE',
    'en-US': 'English (United States): en-US',
    'en-CA': 'English (Canada): en-CA',
    'en-IN': 'English (India): en-IN',
    'es-ES': 'Spanish (Spain): es-ES',
    'fr-CA': 'French (Canada): fr-CA',
    'es-MX': 'Spanish (Mexico): es-MX',
    'it-IT': 'Italian: it-IT',
    'en-AU': 'English (Australia): en-AU',
    'fr-FR': 'French (France): fr-FR',
    'en-GB': 'English (United Kingdom): en-GB',
    'ja-JP': 'Japanese: ja-JP'
  },
  COUNTRY_TO_REALM_MAP: {
    DE: 'eu-west-1',
    AU: 'us-west-2',
    IN: 'eu-west-1',
    JP: 'us-west-2',
    GB: 'eu-west-1',
    IT: 'eu-west-1',
    MX: 'us-east-1',
    FR: 'eu-west-1',
    US: 'us-east-1',
    CA: 'us-east-1',
    ES: 'eu-west-1'
  },
  COUNTRY_TO_LOCALE_MAP: {
    DE: 'de-DE',
    IN: 'en-IN',
    JP: 'ja-JP',
    IT: 'it-IT',
    MX: 'es-MX',
    FR: 'fr-FR',
    ES: 'es-ES',
    BR: 'pt-BR',
    AU: 'en-AU',
    GB: 'en-GB',
    US: 'en-US',
    CA: 'en-CA'
  }
}
