export declare enum ExportResolution {
    P720 = "P720",
    P1080 = "P1080",
    P4K = "P4K"
}
export declare enum ExportPlatform {
    YOUTUBE = "YOUTUBE",
    TIKTOK = "TIKTOK",
    INSTAGRAM = "INSTAGRAM",
    FACEBOOK = "FACEBOOK",
    LINKEDIN = "LINKEDIN",
    TWITTER = "TWITTER"
}
export declare class ExportVideoDto {
    resolution: ExportResolution;
    platform?: ExportPlatform;
}
