import * as log4js from 'log4js'
import { ProjectConfigUtil } from '../util/project-config-util'
import { FilesystemAccess } from '../access/filesystem-access'
import { NpmUtil } from '../util/npm-util'
import { map } from 'rxjs/operators'

/**
 * Workflow definitions for locally building the code
 */
export class BuildWorkflow {
  /**
   * Build the web player
   *
   * @returns {Observable} An observable with the path to the locally built web player
   */
  static runBuildWebPlayerWorkflow () {
    return NpmUtil.buildWebPlayer()
      .pipe(map(() => {
        const projectRoot = ProjectConfigUtil.getProjectRoot()
        const localWebPlayerAbsolutePath = FilesystemAccess.constructPath([projectRoot, 'web-player', 'dist', 'web-player'])
        this.logger.info(`Using this web-player build artifact "${localWebPlayerAbsolutePath}"`)
        return localWebPlayerAbsolutePath
      }))
  }

  /**
   * Build the lambda
   *
   * @returns {Observable} An observable with the path to the locally built lambda
   */
  static runBuildLambdaWorkflow () {
    return NpmUtil.buildLambda()
      .pipe(map(() => {
        // get the build lambda code file name - lambda.[hash].js
        // Because the file name has a hash, it could change with each build
        const projectRoot = ProjectConfigUtil.getProjectRoot()
        const lambdaBuildDir = FilesystemAccess.constructPath([projectRoot, 'lambda', 'dist', 'lambda'])
        const lambdaFileName = FilesystemAccess.listFiles(lambdaBuildDir).filter(f => f.match(/^lambda\..*\.zip$/))[0]
        const localLambdaAbsolutePath = FilesystemAccess.constructPath([lambdaBuildDir, lambdaFileName])
        this.logger.info(`Using this lambda build artifact "${localLambdaAbsolutePath}"`)
        return localLambdaAbsolutePath
      }))
  }

  static get logger () {
    return log4js.getLogger('build-workflow')
  }
}
