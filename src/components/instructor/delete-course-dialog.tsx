"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import {deleteCourse} from "@/app/actions/instructor/course-action";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteCourseDialog {
    userId: string;
    courseId: number;
    courseName: string;
}

export default function DeleteCourseDialog({
    userId,
    courseId,
    courseName,
    }: DeleteCourseDialog) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async () => {

        try {
            const response = await deleteCourse(courseId);
            console.log(response);
            toast.success("Course edited successfully!");
            router.refresh();
        } catch (error) {
            setLoading(false);
            toast.error("An error occurred");
            console.error("Error during editing the course:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-primary font-semibold text-xl text-center">
                        Delete Course
                    </DialogTitle>
                </DialogHeader>
                <form
                    action={async () => {
                        await handleSubmit();
                        setIsOpen(false);
                    }}
                >
                    <div className={`text-center`}>
                        Are you sure wanna delete {``}
                        <span className={`text-[#094C62]`}>
                            {courseName}
                        </span>?
                    </div>
                    <div className="grid gap-4 py-8">
                        <Button type="submit" disabled={loading}>
                            Commit
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
