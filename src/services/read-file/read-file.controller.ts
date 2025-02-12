import { Controller } from '@nestjs/common';
import { ReadFileService } from 'src/services/read-file/read-file.service';

@Controller()
export class ReadFileController {
  constructor(private readonly fileService: ReadFileService) {}

  // @Get('.well-known/assetlinks.json')
  // getData(): any {
  //   const jsonData = this.fileService.readJSONFile('src/common/assetlink.json');
  //   return jsonData;
  // }
}
