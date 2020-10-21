describe('Genymotion-cloud executable', () => {
  const aResponse = (exit_code = 0, exit_code_desc = 'NO_ERROR') => ({
    exit_code,
    exit_code_desc,
  });
  const anErrorResponse = (exit_code, exit_code_desc, error_desc) => ({
    ...aResponse(exit_code, exit_code_desc),
    error: {
      message: `API return unexpected code: ${exit_code}. Error: {"code":"${error_desc}","message":"Oh no, mocked error has occurred!"}`,
      details: '',
    }
  });

  const successResponse = aResponse();
  const failResponse = anErrorResponse(4, 'API_ERROR', 'TOO_MANY_RUNNING_VDS');

  const givenResult = (response, payload) => exec.mockResolvedValue({
    stdout: JSON.stringify({
      ...response,
      ...payload,
    }),
  });
  const givenSuccessResult = () => givenResult(successResponse);
  const givenErrorResult = () => givenResult(failResponse);

  let exec;
  let uut;
  beforeEach(() => {
    jest.mock('../../../../../utils/exec', () => ({
      execWithRetriesAndLogs: jest.fn(),
    }));
    exec = require('../../../../../utils/exec').execWithRetriesAndLogs;

    const GenyCloudExec = require('./GenyCloudExec');
    uut = new GenyCloudExec;
  });

  const recipeName = 'mock-recipe-name';
  const instanceUUID = 'mock-uuid';
  const instanceName = 'detox-instance1';
  [
    {
      commandName: 'Get Recipe',
      commandExecFn: () => uut.getRecipe(recipeName),
      expectedExec: `"gmsaas" --format compactjson recipes list --name "${recipeName}"`,
    },
    {
      commandName: 'Get Instances',
      commandExecFn: () => uut.getInstances(),
      expectedExec: `"gmsaas" --format compactjson instances list`,
    },
    {
      commandName: 'Start Instance',
      commandExecFn: () => uut.startInstance(recipeName, instanceName),
      expectedExec: `"gmsaas" --format compactjson instances start --stop-when-inactive ${recipeName} "${instanceName}"`,
    },
    {
      commandName: 'ADB Connect',
      commandExecFn: () => uut.adbConnect(instanceUUID),
      expectedExec: `"gmsaas" --format compactjson instances adbconnect ${instanceUUID}`,
    },
    {
      commandName: 'Stop Instance',
      commandExecFn: () => uut.stopInstance(instanceUUID),
      expectedExec: `"gmsaas" --format compactjson instances stop ${instanceUUID}`,
    },
  ].forEach((testCase) => {
    describe(`${testCase.commandName} command`, () => {
      it('should execute command by name', async () => {
        givenSuccessResult();

        await testCase.commandExecFn();
        expect(exec).toHaveBeenCalledWith(testCase.expectedExec);
      });

      it('should return the result', async () => {
        givenSuccessResult();

        const result = await testCase.commandExecFn();
        expect(result).toEqual(successResponse);
      });

      it('should fail upon an error result', async () => {
        givenErrorResult();

        try {
          await testCase.commandExecFn();
          fail('Expected an error');
        } catch (e) {
          const error = e.toString();
          console.debug(error);
          expect(error).toContain(testCase.commandName);
          expect(error).toContain(failResponse.exit_code_desc);
          expect(error).toContain(failResponse.error.message);
        }
      });
    });
  });
});
