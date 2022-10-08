import { TanaIntermediateFile, TanaIntermediateNode, TanaIntermediateSummary } from '../../types/types';
import { convertObsidianFile } from './fileConverter';

export function ObsidianSingleFileConverter(fileName: string, fileContent: string, dailyNotePattern: string): TanaIntermediateFile {
  const [node, summary] = convertObsidianFile(fileName, fileContent, dailyNotePattern) as [
    TanaIntermediateNode,
    TanaIntermediateSummary,
    string[],
  ];

  return {
    version: 'TanaIntermediateFile V0.1',
    summary,
    nodes: [node],
  };
}
