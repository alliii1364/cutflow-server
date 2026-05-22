export declare enum BrollGender {
    MALE = "male",
    FEMALE = "female"
}
export declare enum BrollEthnicity {
    WHITE = "white",
    BLACK = "black",
    ASIAN = "asian",
    SPANISH = "spanish",
    SWEDISH = "swedish",
    ITALIAN = "italian",
    BRAZILIAN = "brazilian",
    UKRAINIAN = "ukrainian",
    EUROPEAN = "european",
    BRITISH = "british"
}
export declare class GetBrollLibraryDto {
    q?: string;
    gender?: BrollGender;
    ethnicity?: BrollEthnicity;
    minAge?: number;
    maxAge?: number;
}
