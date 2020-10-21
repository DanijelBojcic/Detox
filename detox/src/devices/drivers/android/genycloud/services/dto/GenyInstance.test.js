describe('Genymotion-Cloud Instance DTO', () => {
  const connectedRawInstance = {
    uuid: 'mock-uuid',
    name: 'mock-name',
    adb_serial: 'localhost:7777',
    adb_serial_port: 7777,
    recipe: {
      uuid: 'mock-recipe-uuid',
      name: 'mock-recipe-name',
    },
  };

  const disconnectedRawInstance = {
    uuid: 'mock-uuid',
    name: 'mock-name',
    adb_serial: '0.0.0.0',
    adb_serial_port: 0,
    recipe: {
      uuid: 'mock-recipe-uuid',
      name: 'mock-recipe-name',
    },
  };

  let Instance;
  beforeEach(() => {
    Instance = require('./GenyInstance');
  });

  it('should have proper fields', () => {
    const rawInstance = connectedRawInstance;

    const instance = new Instance(rawInstance);

    expect(instance.uuid).toEqual('mock-uuid');
    expect(instance.name).toEqual('mock-name');
    expect(instance.adbName).toEqual(rawInstance.adb_serial);
    expect(instance.recipeName).toEqual('mock-recipe-name');
    expect(instance.recipeUUID).toEqual('mock-recipe-uuid');
  });

  it('should indicate an ADB-connection', () => {
    const instance = new Instance(connectedRawInstance);
    expect(instance.isAdbConnected()).toEqual(true);
  });

  it('should indicate an ADB-disconnection', () => {
    const instance = new Instance(disconnectedRawInstance);
    expect(instance.isAdbConnected()).toEqual(false);
  });
});
