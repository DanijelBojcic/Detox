const _ = require('lodash');
const logger = require('../../../../utils/logger').child({ __filename });
const AndroidDriver = require('../AndroidDriver');
const GenyCloudExec = require('./exec/GenyCloudExec');
const RecipesService = require('./services/GenyRecipesService');
const InstanceLookupService = require('./services/GenyInstanceLookupService');
const InstanceLifecycleService = require('./services/GenyInstanceLifecycleService');
const InstanceNaming = require('./services/GenyInstanceNaming');

// TODO unit test
class GenyCloudDriver extends AndroidDriver {
  constructor(config) {
    super(config);
    this._name = 'Unspecified Genymotion Cloud Emulator';

    const exec = new GenyCloudExec();
    const instanceNaming = new InstanceNaming(); // TODO should probably come up with a far less restrictive impl for debug mode, dev mode. Maybe even a custom arg in package.json (Detox > ... > device > something)
    this.recipeService = new RecipesService(exec, logger);
    this.instanceLookupService = new InstanceLookupService(exec, instanceNaming, this.deviceRegistry);
    this.instanceLifecycleService = new InstanceLifecycleService(exec, instanceNaming);
  }

  get name() {
    return this._name
  }

  async acquireFreeDevice(deviceQuery) {
    const recipeName = _.isPlainObject(deviceQuery) ? deviceQuery.recipeName : deviceQuery; // TODO consider recipeUUID
    const recipe = await this.recipeService.getRecipeByName(recipeName);

    const cookie = {
      coldBoot: false,
    };
    const adbName = await this.allocateDevice({
      recipe,
      cookie,
      toString: () => recipe.toString(),
    });

    await this.emitter.emit('bootDevice', { coldBoot: cookie.coldBoot, deviceId: adbName, type: recipeName});
    await this.adb.apiLevel(adbName);
    await this.adb.disableAndroidAnimations(adbName);

    this._name = `Genycloud ${adbName} (${recipeName})`;
    return adbName;
  }

  async doAllocateDevice({ recipe, cookie }) {
    let instance = await this.instanceLookupService.findFreeInstance(recipe.uuid);
    if (!instance) {
      instance = await this.instanceLifecycleService.createInstance(recipe.uuid); // TODO this should be retried if instance limit is hit
      cookie.coldBooted = true;
    }

    if (!instance.isAdbConnected()) {
      instance = await this.instanceLifecycleService.adbConnectInstance(instance.uuid);
    }

    return instance.adbName;
  }
}

module.exports = GenyCloudDriver;
