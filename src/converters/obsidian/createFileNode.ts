import { NodeType, TanaIntermediateNode } from '../../types/types';
import { FrontmatterData } from './parseFrontmatter';
import { UidRequestType, VaultContext } from './VaultContext';
import moment from 'moment'

export function createFileNode(
  displayName: string,
  today: number,
  context: VaultContext,
  frontmatter: FrontmatterData[],
): TanaIntermediateNode {
  const supertags: string[] = [];

  frontmatter.forEach((data) => {
    if (data.key === 'tags') {
      supertags.push(...data.values.map((val) => context.superTagUid(val)));
    }
  });

  let nodeUid = context.uidRequest(displayName, UidRequestType.FILE);
  let nodeType: NodeType = 'node';
  const dateDisplayName =  dateStringToDateUID(displayName, context.dailyNoteFormat);

  if (dateDisplayName.length > 0) {
    nodeUid = dateDisplayName;
    nodeType = 'date';
    displayName = dateDisplayName;
  }

  return {
    uid: nodeUid,
    name: displayName,
    createdAt: today,
    editedAt: today,
    type: nodeType,
    supertags: supertags.length > 0 ? supertags : undefined,
  };
}

function dateStringToDateUID(displayName: string, dateFormat: string): string
{
  let date= moment(displayName, dateFormat);
  if (date.isValid()){
    return date.format('MM-DD-YYYY');
  }
  return '';
}