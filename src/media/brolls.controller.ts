import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Brolls')
@Controller('brolls')
export class BrollsController {
  constructor(private mediaService: MediaService) {}

  @Public()
  @Get('library')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  @ApiOperation({ summary: 'Get B-roll library with categories and items' })
  @ApiQuery({ name: 'q', required: false, description: 'Search by name or tags' })
  getBrollLibrary(@Query('q') q?: string) {
    return this.mediaService.getBrollLibrary(q);
  }
}
