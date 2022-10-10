import { NodeType, TanaIntermediateNode } from '../../types/types';
import { convertMarkdownNode } from './convertMarkdownNode';
import { createTree } from './createTree';
import { HierarchyType, MarkdownNode, extractMarkdownNodes } from './extractMarkdownNodes';
import { HeadingTracker } from './filterHeadingLinks';
import { UidRequestType, VaultContext } from './VaultContext';
import moment from 'moment'

export function convertObsidianFile(
  fileName: string, //without ending
  fileContent: string,
  context: VaultContext,
  today: number = Date.now(),
  headingTracker?: HeadingTracker,
) {
  let startIndex = 0;

  if (fileContent.startsWith('---\n')) {
    const frontMatterEndIndex = fileContent.indexOf('\n---\n');
    if (frontMatterEndIndex !== -1) {
      startIndex = frontMatterEndIndex + '\n---\n'.length;
    }
  }

  let obsidianNodes = extractMarkdownNodes(fileContent, startIndex);
  let displayName = fileName;

  //LogSeq specific
  const name = obsidianNodes[0] && obsidianNodes[0].content.match(/^title::(.+)$/);
  if (name) {
    displayName = name[1];
    obsidianNodes = obsidianNodes.slice(1);
  }

  // common in Obsidian to repeat the filename in the first line, remove first line if so
  if (obsidianNodes[0] && obsidianNodes[0].content.replace(/^#+/, '').trim() === displayName.trim()) {
    obsidianNodes = obsidianNodes.slice(1);
  }

  const headingNodes: (MarkdownNode & { uid: string })[] = [];

  const fileNode = createFileNode(displayName, today, context);

  createTree(
    fileNode,
    { type: HierarchyType.ROOT, level: -1 } as MarkdownNode,
    obsidianNodes,
    isChild,
    (markdownNode) => {
      return convertMarkdownNode(fileName, markdownNode, today, context);
    },
    (tanaNode, markdownNode) => {
      if (markdownNode.type === HierarchyType.HEADING) {
        headingNodes.push({ ...markdownNode, uid: tanaNode.uid });
      }
    },
  );

  headingTracker?.set(fileName, headingNodes);

  return fileNode;
}

function createFileNode(displayName: string, today: number, context: VaultContext): TanaIntermediateNode {
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
  };
}

function isChild(potentialParent: MarkdownNode, potentialChild: MarkdownNode) {
  if (potentialParent.type === HierarchyType.ROOT) {
    return true;
  }

  //HEADING is always a parent of non-headings
  if (potentialParent.type === HierarchyType.HEADING && potentialChild.type !== HierarchyType.HEADING) {
    return true;
  }

  //PARAGRAPH can only be child of HEADING and can not be a parent
  if (potentialParent.type === HierarchyType.PARAGRAPH || potentialChild.type === HierarchyType.PARAGRAPH) {
    return false;
  }

  if (potentialParent.type === potentialChild.type) {
    return potentialParent.level < potentialChild.level;
  }

  return false;
}


function dateStringToDateUID(displayName: string, dateFormat: string): string
{
  let date= moment(displayName, dateFormat);
  if (date.isValid()){
    return date.format('MM-DD-YYYY');
  }
  return '';
}