import type { LucideIcon } from "lucide-react";

export interface UploadedMedia {
    id: string;
    file: File;
    url: string;
    type: "image" | "video";
    caption?: string;
}

export interface FeelingOption {
    emoji: string;
    label: string;
}

export interface VisibilityOption {
    value: string;
    label: string;
    Icon: LucideIcon;
}
