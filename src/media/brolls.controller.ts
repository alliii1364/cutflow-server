import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { Public } from '../common/decorators/public.decorator';
import { GetBrollLibraryDto } from './dto/get-broll-library.dto';

@ApiTags('Brolls')
@Controller('brolls')
export class BrollsController {
  constructor(private mediaService: MediaService) {}

  @Public()
  @Get('library')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  @ApiOperation({ summary: 'Get B-roll library with categories and items' })
  getBrollLibrary(@Query() query: GetBrollLibraryDto) {
    return this.mediaService.getBrollLibrary(query);
  }
}
