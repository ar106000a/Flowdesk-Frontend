import { useState, useEffect, useRef } from "react";
// import axios from "axios";
import api from "../../../lib/api";
import { useAuth } from "../../../hooks/UseAuth";
import { useSocket } from "../../../hooks/UseSocket";
import type { Comment } from "../../../types";
import styles from "./TaskComments.module.css";
import { useToast } from "../../../hooks/UseToast";

interface TaskCommentsProps {
  taskId: string;
  projectId: string;
}

export function TaskComments({ taskId, projectId }: TaskCommentsProps) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchComments = async () => {
      try {
        const res = await api.get(
          `/api/projects/${projectId}/tasks/${taskId}/comments`,
        );
        if (isMounted) {
          setComments(res.data.data);
        }
      } catch {
        // Silent fail — comments aren't critical
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [projectId, taskId]);

  // Scroll to bottom when comments load or new one arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // 2. Real-time WebSocket Updates (Race-Condition Guarded)
  useEffect(() => {
    function onCommentCreated(incomingComment: Comment) {
      // Guard: Ensure comment belongs to this task
      if (incomingComment.task_id !== taskId) return;

      setComments((prev) => {
        // Guard A: If it already exists by its permanent database ID, drop it
        if (prev.some((c) => c.id === incomingComment.id)) return prev;

        // Guard B: Check if there's an optimistic temporary comment matching this content from this user
        const optimisticMatch = prev.find(
          (c) =>
            c.id.toString().startsWith("temp-") &&
            c.content === incomingComment.content &&
            c.user_id === incomingComment.user_id,
        );

        if (optimisticMatch) {
          // The socket beat the HTTP response! Swap the temp object with the real one right here
          return prev.map((c) =>
            c.id === optimisticMatch.id ? incomingComment : c,
          );
        }

        // If no match, it's genuinely a comment from someone else. Add it to the list.
        return [...prev, incomingComment];
      });
    }

    function onCommentDeleted({
      commentId,
      taskId: tid,
    }: {
      commentId: string;
      taskId: string;
    }) {
      if (tid !== taskId) return;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }

    socket.on("comment:created", onCommentCreated);
    socket.on("comment:deleted", onCommentDeleted);

    return () => {
      socket.off("comment:created", onCommentCreated);
      socket.off("comment:deleted", onCommentDeleted);
    };
  }, [socket, taskId]);

  // 3. Form Submission (Race-Condition Guarded)
  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      task_id: taskId,
      user_id: user?.id ?? "",
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Trigger optimistic UI snap
    setComments((prev) => [...prev, optimistic]);
    setContent("");

    try {
      const res = await api.post(
        `/api/projects/${projectId}/tasks/${taskId}/comments`,
        { content: optimistic.content },
      );

      // Safe State Swap: Only swap if the WebSocket listener hasn't already swapped it out
      setComments((prev) => {
        const tempExists = prev.some((c) => c.id === optimistic.id);
        if (!tempExists) return prev; // Socket already handled it!

        return prev.map((c) => (c.id === optimistic.id ? res.data.data : c));
      });
    } catch {
      // Rollback on failure, restoring text to the input field
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setContent(optimistic.content);
      addToast("Failed to post comment", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 4. Delete Handler
  async function handleDelete(commentId: string) {
    const originalComments = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      await api.delete(
        `/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
      );
    } catch (err: unknown) {
      setComments(originalComments);
      addToast("Could not delete comment. Server Error!", "error");
      console.error(err);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.sectionLabel}>// Comments</p>

      {/* Comment list */}
      <div className={styles.list}>
        {isLoading ? (
          <p className={styles.empty}>Loading...</p>
        ) : comments.length === 0 ? (
          <p className={styles.empty}>No comments yet. Be the first.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <span className={styles.avatar}>
                  {user?.id === comment.user_id ? "YOU" : "OP"}
                </span>
                <span className={styles.time}>
                  {formatTime(comment.created_at)}
                </span>
                {user?.id === comment.user_id && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(comment.id)}
                    type="button"
                    aria-label="Delete comment"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className={styles.commentBody}>{comment.content}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          className={styles.input}
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          disabled={isSubmitting}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
