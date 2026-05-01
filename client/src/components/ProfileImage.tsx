import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
interface ProfileImageProps {
    imageUrl: string;
    onImageUpdate: (newImageUrl: string) => void;
}
export function ProfileImage({ imageUrl, onImageUpdate }: ProfileImageProps) {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const inputRef = useRef<HTMLInputElement>(null);
    const handleUploadClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please select an image smaller than 5MB.",
                variant: "destructive"
            });
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please select a JPEG, PNG, or GIF image.",
                variant: "destructive"
            });
            return;
        }
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append("image", file);
            const response = await fetch("/api/profile/image", {
                method: "POST",
                body: formData,
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error("Failed to upload image");
            }
            const data = await response.json();
            onImageUpdate(data.imagePath);
            toast({
                title: "Success",
                description: "Profile image updated successfully.",
                variant: "default"
            });
        }
        catch (error) {
            console.error("Error uploading image:", error);
            toast({
                title: "Upload Failed",
                description: "There was an error uploading your image. Please try again.",
                variant: "destructive"
            });
        }
        finally {
            setIsUploading(false);
        }
    };
    return (<div className="relative">
      <Input type="file" ref={inputRef} accept="image/jpeg,image/png,image/gif" className="hidden" onChange={handleFileChange}/>
      <Button size="icon" onClick={handleUploadClick} className="rounded-full bg-accent hover:bg-accent/90 h-9 w-9 shadow-md" disabled={isUploading}>
        {isUploading ? (<i className="fas fa-spinner fa-spin text-white"></i>) : (<i className="fas fa-camera text-white"></i>)}
      </Button>
    </div>);
}
