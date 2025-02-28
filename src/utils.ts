import { execa } from 'execa';

export async function gitShow(excludePaths: string[] = []): Promise<string> {
  const { stdout } =
    excludePaths.length === 0
      ? await execa`git show`
      : await execa`git show ${excludePaths.map((path) => `:(exclude)${path}`).join(' ')}`;
  return stdout;
}
