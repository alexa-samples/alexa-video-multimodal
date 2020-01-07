import { FilesystemAccess } from '../access/filesystem-access'
import { CliUtil } from './cli-util'
import { ProjectConfigUtil } from './project-config-util'
import { APP_LOGGER } from '../infrastructure'
import { map } from 'rxjs/operators'
import { Util } from './util'

/**
 * Utility class for building the lambda and web player code
 */
export class NpmUtil {
  /**
   * Build the web player code and check for build success
   *
   * @returns {Observable} An observable
   */
  static buildWebPlayer () {
    APP_LOGGER.info('Building the web player')
    const gitRepoPath = ProjectConfigUtil.getProjectRoot()
    const webPlayerDir = FilesystemAccess.constructPath([gitRepoPath, 'web-player'])
    const cmd = `cd ${webPlayerDir} && npm run release`
    return CliUtil.runCommand(cmd, 'build web-player code')
      .pipe(map(() => {
        const webPlayerBuildOutput = FilesystemAccess.constructPath([ProjectConfigUtil.getProjectRoot(), 'web-player', 'dist', 'web-player'])
        if (!FilesystemAccess.checkIfFileOrDirectoryExists(webPlayerBuildOutput)) {
          Util.exitWithError('The web player build failed')
        } else {
          const builtFiles = FilesystemAccess.listFiles(webPlayerBuildOutput)
          if (builtFiles.length === 0) {
            Util.exitWithError('The web player build failed')
          } else {
            APP_LOGGER.info('The web player build succeeded')
          }
        }
      }))
  }

  /**
   * Build the lambda code and check for build success
   *
   * @returns {Observable} An observable
   */
  static buildLambda () {
    APP_LOGGER.info('Building the lambda')
    const gitRepoPath = ProjectConfigUtil.getProjectRoot()
    const lambdaDir = FilesystemAccess.constructPath([gitRepoPath, 'lambda'])
    const cmd = `cd ${lambdaDir} && npm run release`
    return CliUtil.runCommand(cmd, ' build lambda code')
      .pipe(map(() => {
        const lambdaBuildOutputDir = FilesystemAccess.constructPath([ProjectConfigUtil.getProjectRoot(), 'lambda', 'dist', 'lambda'])
        if (!FilesystemAccess.checkIfFileOrDirectoryExists(lambdaBuildOutputDir)) {
          Util.exitWithError('The lambda build failed')
        } else {
          const builtFiles = FilesystemAccess.listFiles(lambdaBuildOutputDir)
          if (builtFiles.length === 0) {
            Util.exitWithError('The lambda build failed')
          } else {
            APP_LOGGER.info('The lambda build succeeded')
          }
        }
      }))
  }
}
