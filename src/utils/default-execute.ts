import { exec } from "child_process";

const execute = (command: string): Promise<string> => {
  return new Promise<string>((res, rej) => {
    exec(command, (err: any, stdout: string, stderr: string) => {
      if (err) rej(err);
      if (stdout) res(stdout);
      if (stderr) rej(stderr);
    });
  });
};

export default execute;
