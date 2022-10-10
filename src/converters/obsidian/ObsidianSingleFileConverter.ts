import path from 'path';
import { TanaIntermediateFile } from '../../types/types';
import { convertObsidianFile } from './convertObsidianFile';
import { createUnlinkedTanaNodes } from './createUnlinkedTanaNodes';
import { VaultContext } from './VaultContext';

export function ObsidianSingleFileConverter(
  fileName: string,
  fileContent: string,
  today: number = Date.now(),
  vaultContext: VaultContext = new VaultContext(),
, dailyNotePattern: string): TanaIntermediateFile {
  const importName = path.basename(fileName).replace('.md', '');
  const node = convertObsidianFile(importName, fileContent, dailyNotePattern, vaultContext, today);
  //the file node needs to be counted as a top level node
  vaultContext.summary.leafNodes--;
  vaultContext.summary.topLevelNodes++;

  const collectedUnlinkedNodes = createUnlinkedTanaNodes(importName, today, vaultContext);
  const nodes = [node];
  if (collectedUnlinkedNodes) {
    nodes.push(collectedUnlinkedNodes);
  }
  return {
    version: 'TanaIntermediateFile V0.1',
    summary: vaultContext.summary,
    nodes: nodes,
  };
}


export function isDailyNote(displayName: string, dailyNoteFormat: string): boolean
{
  return (dateStringToDateUID(displayName, dailyNoteFormat)?.length > 0);
}

export function dateStringToDateUID(displayName: string, dateFormat: string): string
{
  let date= moment(displayName, dateFormat);
  if (date.isValid()){
    return date.format('MM-DD-YYYY');
  }
  return '';
}