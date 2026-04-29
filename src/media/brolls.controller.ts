import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Brolls')
@Controller('brolls')
export class BrollsController {
  constructor(private mediaService: MediaService) {}

  @Public()
  @Get('library')
  @ApiOperation({ summary: 'Get B-roll library with categories and items' })
  getBrollLibrary() {
    return this.mediaService.getBrollLibrary();
  }
}
