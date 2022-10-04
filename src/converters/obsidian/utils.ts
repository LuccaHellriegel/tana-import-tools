import moment from "moment";

export function countEmptySpace(content: string, curPosition: number, count = 0): number {
  //we count tab as one empty space
  if (content[curPosition] !== ' ' && content[curPosition] !== '\t') return count;
  return countEmptySpace(content, curPosition + 1, count + 1);
}

export function nextNewLine(content: string, curPosition: number, count = 0): number {
  //end of file is also counted as newline for simplicity
  if (content[curPosition + count] === undefined || content[curPosition + count] === '\n') return curPosition + count;
  return nextNewLine(content, curPosition, count + 1);
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