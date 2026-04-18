"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { Loader2, Star } from "lucide-react";

interface ReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transaction: any;
}

export function ReviewModal({ open, onOpenChange, transaction }: ReviewModalProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({ variant: "destructive", title: "Rating Required", description: "Please select a star rating." });
            return;
        }
        if (!firestore || !user) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(firestore, "reviews"), {
                listingId: transaction.listingId,
                transactionId: transaction.id,
                sellerId: transaction.sellerId,
                buyerId: user.uid,
                buyerEmail: user.email,
                hustleName: transaction.hustleName,
                rating,
                review: review.trim(),
                createdAt: serverTimestamp(),
            });

            // Mark transaction as reviewed
            await updateDoc(doc(firestore, "transactions", transaction.id), {
                reviewed: true,
            });

            toast({ title: "Review Submitted! ⭐", description: "Thanks for your feedback!" });
            onOpenChange(false);
            setRating(0);
            setReview("");
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to submit", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-[2.5rem]">
                <DialogHeader>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10 mb-4">
                        <Star className="h-7 w-7 text-yellow-500 fill-yellow-500" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center">Rate Your Experience</DialogTitle>
                    <DialogDescription className="text-center font-medium">
                        How was your experience with <strong>{transaction?.hustleName}</strong>?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Star rating */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onMouseEnter={() => setHovered(star)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`h-10 w-10 transition-colors ${
                                        star <= (hovered || rating)
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-muted-foreground"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-center text-sm font-bold text-muted-foreground">
                            {rating === 1 && "Poor"}
                            {rating === 2 && "Fair"}
                            {rating === 3 && "Good"}
                            {rating === 4 && "Great"}
                            {rating === 5 && "Excellent!"}
                        </p>
                    )}

                    {/* Review text */}
                    <Textarea
                        placeholder="Share your experience with this seller... (optional)"
                        className="rounded-xl min-h-[100px]"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                        Skip
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 rounded-xl font-black">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}