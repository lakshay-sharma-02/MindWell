
import { Button } from "@/components/ui/button";
import { Link2, Twitter, Linkedin, Facebook } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface SocialShareProps {
    title: string;
    url?: string; // Defaults to current URL if missing
}

export function SocialShare({ title, url }: SocialShareProps) {
    const currentUrl = url || window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(title);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>

            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank')}>
                <Twitter className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')}>
                <Linkedin className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')}>
                <Facebook className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={handleCopyLink}>
                <Link2 className="w-4 h-4" />
            </Button>
        </div>
    );
}
