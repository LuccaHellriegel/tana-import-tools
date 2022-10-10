import { appendFileSync, unlinkSync } from 'fs';
import path from 'path';
import { createUnlinkedTanaNodes } from './createUnlinkedTanaNodes';
import { addFileNode, addParentNodeEnd, addParentNodeStart, handleVault } from './vault';
import { VaultContext } from './VaultContext';

/**
 * Converts the vault to the Tana format and incrementally saves it, otherwise it would be to memory intensive on big vaults.
 * Due to the incremental approach the output-file will be valid JSON but not be formatted perfectly.
 */
export function ObsidianVaultConverter(
  vaultPath: string,
  today: number = Date.now(),
  vaultContext: VaultContext = new VaultContext(vaultPath),
) {

  const targetPath = `${vaultContext.vaultPath}.tif.json`;
  try {
    unlinkSync(targetPath);
    // eslint-disable-next-line no-empty
  } catch (e) {}
  appendFileSync(targetPath, '{\n  "version": "TanaIntermediateFile V0.1",\n  "nodes": [\n');

  handleVault(
    vaultContext.vaultPath,
    addParentNodeStart(targetPath, today, vaultContext),
    addParentNodeEnd(targetPath),
    addFileNode(targetPath, today, vaultContext),
  );

  //the vault-node needs to be counted as a top level node
  vaultContext.summary.leafNodes--;
  vaultContext.summary.topLevelNodes++;

  const collectedUnlinkedNodes = createUnlinkedTanaNodes(path.basename(vaultContext.vaultPath), today, vaultContext);
  if (collectedUnlinkedNodes) {
    appendFileSync(targetPath, ', ' + JSON.stringify(collectedUnlinkedNodes, null, 2));
  }

  appendFileSync(targetPath, '\n  ],\n  "summary": \n' + JSON.stringify(vaultContext.summary, null, 2) + '\n}');

  return vaultContext.summary;
}
