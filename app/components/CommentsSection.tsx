"use client";
import { useState } from "react";
import { motion } from "framer-motion";
interface Comment {
    id: number;
    user: string;
    text: string;
}
export default function CommentsSection() {
    const [comments, setComments] = useState<Comment[]>([
        { id: 1, user: "Alice", text: "This site is amazing! <b>Love it!</b>" },
        { id: 2, user: "Bob", text: "Is this safe? <i>I hope so...</i>" },
    ]);
    const [newComment, setNewComment] = useState("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setComments([
            ...comments,
            { id: Date.now(), user: "You", text: newComment }
        ]);
        setNewComment("");
    };
    return (
        <section className="py-20 px-4 bg-black text-white">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">User Feedback</h2>
                <div className="space-y-4 mb-8">
                    {comments.map((comment) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-zinc-900 p-4 rounded-lg border border-zinc-800"
                        >
                            <div className="font-bold text-purple-400 mb-2">{comment.user} says:</div>
                            <div
                                className="text-gray-300"
                                dangerouslySetInnerHTML={{ __html: comment.text }}
                            />
                        </motion.div>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800">
                    <label className="block mb-2 font-bold">Leave a comment:</label>
                    <textarea
                        className="w-full bg-black border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-purple-500"
                        rows={4}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="<b>HTML</b> is allowed (and encouraged!)"
                    />
                    <button
                        type="submit"
                        className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition-colors"
                    >
                        Post Comment
                    </button>
                </form>
            </div>
        </section>
    );
}
