/* eslint-disable @typescript-eslint/no-unused-vars */
import { fs } from '@zip.js/zip.js';
import type { FS, ZipFileEntry, ZipEntry, ZipDirectoryEntry } from '@zip.js/zip.js';

import { CustomFileSystemAdapter, SEPARATOR } from './CustomFileSystemAdapter';

export class WebFileSystemAdapter implements CustomFileSystemAdapter {
  private zipFS: FS | undefined;
  private chunks: string[] = [];
  private chunkIndex = 0;

  constructor(private zipBlob: Blob) {}

  async initReadingVault() {
    this.zipFS = new fs.FS() as FS;
    await this.zipFS.importBlob(this.zipBlob);
  }

  readDirectory(dir: string) {
    const result = ((this.zipFS as FS).find(dir) as ZipEntry).children;
    return result.map((entry) => ({
      isDirectory: () => !!(entry as ZipDirectoryEntry).directory,
      getName: () => entry.getFullname(),
    }));
  }

  readFile(file: string) {
    return ((this.zipFS as FS).find(file) as ZipFileEntry<string, string>).getText('utf-8');
  }

  exists(path: string) {
    return !!(this.zipFS as FS).find(path);
  }

  resolve(path: string) {
    return path;
  }

  resolveInDir(dir: string, name: string) {
    return dir + SEPARATOR + name;
  }

  //not necessary for browser
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeFile(_targetPath: string) {}
  //not necessary for browser
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  renameFile(_oldPath: string, _newPath: string) {}
  //not necessary for browser
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  flushResultsFromInitialProcessing(_targetPath: string) {}

  appendToResultFile(_targetPath: string, chunk: string) {
    this.chunks.push(chunk);
  }

  appendToPostProcessingFile(_targetPath: string, chunk: string) {
    //on local we write into a different file, here we just overwrite the chunks
    this.chunks[this.chunkIndex] = chunk;
    this.chunkIndex++;
  }

  //not necessary for browser
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initPostProcessingResultFile(_path: string) {}

  chunkIter() {
    const chunks = this.chunks;
    let index = 0;
    const iterator = {
      [Symbol.asyncIterator]() {
        return {
          async next(): Promise<{ done: boolean; value?: string }> {
            if (index < chunks.length) {
              const chunk = chunks[index];
              index++;
              return { done: false, value: chunk };
            } else {
              return { done: true };
            }
          },
        };
      },
    };

    return iterator as AsyncIterable<string>;
  }

  endPostProcessingFile(_targetPath: string) {
    (this.zipFS as FS).remove((this.zipFS as FS).children[0]);
  }

  getResult() {
    return this.chunks.join('');
  }
}
