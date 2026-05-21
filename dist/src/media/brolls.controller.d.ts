import { MediaService } from './media.service';
import { GetBrollLibraryDto } from './dto/get-broll-library.dto';
export declare class BrollsController {
    private mediaService;
    constructor(mediaService: MediaService);
    getBrollLibrary(query: GetBrollLibraryDto): Promise<{
        success: boolean;
        data: unknown[];
    }>;
}
