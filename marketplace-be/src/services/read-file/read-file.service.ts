import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class ReadFileService {
  readJSONFile(filePath: string): any {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading JSON file:', err);
      return null;
    }
  }
}
