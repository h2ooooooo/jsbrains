import {JsBrainsError} from '@jalsoedesign/jsbrains';
import {CliContext} from '@cli/context';
import type {CliEnvironment} from '@cli/context';
import {CliError, parseOptions, wantsJson} from '@cli/options';
import {executeCommand} from '@cli/commands';
import {CliOutput} from '@cli/output';
import type {JsonResponse} from '@cli/output';

export interface CliIO extends CliEnvironment {
   stdout: (text: string) => void;
   stderr: (text: string) => void;
   stdoutIsTTY: boolean;
}

export async function runCli(arguments_: string[], io: CliIO): Promise<number> {
   let json = wantsJson(arguments_);
   let output = new CliOutput(false);

   try {
      const options = parseOptions(arguments_);
      json = options.json;
      const automaticColor = io.env.NO_COLOR === undefined && io.env.FORCE_COLOR !== '0'
         && (io.stdoutIsTTY || (io.env.FORCE_COLOR !== undefined && io.env.FORCE_COLOR !== ''));
      output = new CliOutput(!json && (options.color ?? automaticColor));
      const context = new CliContext(options, io);
      const result = await executeCommand(options, context);
      const response: JsonResponse = {schemaVersion: 1, command: options.command, data: result.data};

      if (json) {
         io.stdout(`${JSON.stringify(response, null, 2)}\n`);
      } else {
         io.stdout(output.format(response));
      }

      return result.exitCode ?? 0;
   } catch (error) {
      let code = 'READ_FAILED';
      let message = 'Could not read JetBrains configuration. Check file access and the selected paths.';
      let exitCode = 1;

      if (error instanceof CliError) {
         code = error.code;
         message = error.message;
         exitCode = error.exitCode;
      } else if (error instanceof JsBrainsError) {
         message = error.message;
      }

      if (json) {
         io.stderr(`${JSON.stringify({schemaVersion: 1, error: {code, message}}, null, 2)}\n`);
      } else {
         io.stderr(output.error(code, message));
      }

      return exitCode;
   }
}
