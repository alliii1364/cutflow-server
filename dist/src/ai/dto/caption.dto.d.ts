export declare class CaptionStyleDto {
    font?: string;
    color?: string;
    size?: number;
    position?: 'top' | 'bottom' | 'middle';
    animated?: boolean;
}
export declare class GenerateCaptionsDto {
    language: string;
    style?: CaptionStyleDto;
}
export declare class UpdateCaptionsDto {
    segments?: Array<{
        start: number;
        end: number;
        text: string;
        words?: Array<{
            word: string;
            start: number;
            end: number;
        }>;
    }>;
    style?: CaptionStyleDto;
    isAnimated?: boolean;
}
