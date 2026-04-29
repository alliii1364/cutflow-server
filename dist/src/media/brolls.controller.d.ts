import { MediaService } from './media.service';
export declare class BrollsController {
    private mediaService;
    constructor(mediaService: MediaService);
    getBrollLibrary(): Promise<{
        success: boolean;
        data: {
            id: string;
            name: string;
            subcategories: {
                id: string;
                name: string;
                items: {
                    id: string;
                    name: string;
                    description: string;
                    url: string;
                    thumbnail_url: string;
                    type: "image" | "video";
                    is_premium: boolean;
                }[];
            }[];
        }[];
    }>;
}
