const _ = require('lodash');
const { BinaryExec } = require('../../exec/BinaryExec');

class GenyCloudExec {
  constructor() {
    this.execBin = new GenyCloudBinExec();
  }

  getRecipe(name) {
    return this.execBin.execRaw(`recipes list --name "${name}"`, '"Get Recipe"');
  }

  getInstances() {
    return this.execBin.execRaw(`instances list`, 'Get Instances');
  }

  startInstance(recipeName, instanceName) {
    return this.execBin.execRaw(`instances start --stop-when-inactive ${recipeName} "${instanceName}"`, 'Start Instance');
  }

  adbConnect(instanceUUID) {
    return this.execBin.execRaw(`instances adbconnect ${instanceUUID}`, 'ADB Connect');
  }

  stopInstance(instanceUUID) {
    return this.execBin.execRaw(`instances stop ${instanceUUID}`, 'Stop Instance');
  }
}

class GenyCloudBinExec extends BinaryExec {
  constructor() {
    super('gmsaas');
  }

  async execRaw(command, commandName) {
    const rawResult = await super.execRaw(`--format compactjson ${command}`);
    const resultJSON = JSON.parse(rawResult);
    if (resultJSON.exit_code) {
      const message = _.get(resultJSON, ['error', 'message'])
      throw new Error(`Failed to execute command: ${commandName}. Genymotion-Cloud has responded with an error (code=${resultJSON.exit_code}, ${resultJSON.exit_code_desc}):\n${message}`);
    }
    return resultJSON;
  }
}

module.exports = GenyCloudExec;
