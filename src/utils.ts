import { execa } from 'execa';

export async function gitDiff(options: {
  src: string;
  dst: string;
  excludePaths: string[];
}): Promise<string> {
  const { src, dst, excludePaths } = options;

  const { stdout } = await execa('git', [
    'diff',
    '--no-prefix',
    src,
    dst,
    '--',
    '.',
    ...excludePaths.map((path) => `:!${path}`),
  ]);

  return stdout;
}
