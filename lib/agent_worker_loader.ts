import * as fs from 'fs';
import { registerTSNode, loadFile } from './loader_util';
import { ETConfig } from './app_worker_loader';
import { fork as tsFork } from './fork';
import { ForkOptions } from 'child_process';
const EggLoader = require('egg').AgentWorkerLoader as any;
export { EggLoader };

export default class AgentWorkerLoader extends EggLoader {
  protected get baseDir() {
    return this.options.baseDir as string;
  }
  private get etConfig(): ETConfig {
    return (
      (this.app.config && this.app.config.et) || {
        useTSRuntime: false,
      }
    );
  }
  private registeredTS = false;

  load() {
    if (this.etConfig.useTSRuntime) {
      registerTSNode(this.baseDir);
      this.registeredTS = true;
      if (this.config.controller) {
        this.config.controller.fork = (
          modulePath: string,
          args?: ReadonlyArray<string>,
          options?: ForkOptions
        ) => tsFork(this.baseDir, modulePath, args, options);
      }
    }

    super.load();
  }

  loadFile(filepath: string, ...inject: any[]) {
    if (!this.registeredTS) {
      return super.loadFile(filepath, ...inject);
    }
    const tsFilePath = filepath.replace('.js', '.ts');
    if (!fs.existsSync(tsFilePath)) {
      // fallback
      return super.loadFile(filepath, ...inject);
    }
    let ret = loadFile(tsFilePath);
    if ('default' in ret) {
      ret = ret.default;
    }
    // function(arg1, args, ...) {}
    if (inject.length === 0) inject = [this.app];
    return ret instanceof Function ? ret(...inject) : ret;
  }
}
