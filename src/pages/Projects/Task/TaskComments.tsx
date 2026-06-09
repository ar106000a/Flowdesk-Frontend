import { useState, useEffect, useRef } from "react";
// import axios from "axios";
import api from "../../../lib/api";
import { useAuth } from "../../../hooks/UseAuth";
import { useSocket } from "../../../hooks/UseSocket";
import type { Comment } from "../../../types";
import styles from "./TaskComments.module.css";

interface TaskCommentsProps {
  taskId: string;
  projectId: string;
}

export function TaskComments({ taskId, projectId }: TaskCommentsProps) {
  const { user } = useAuth();
  const { socket } = useSocket();

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

  // Real-time comment events
  useEffect(() => {
    function onCommentAdded({
      comment,
      taskId: tid,
    }: {
      comment: Comment;
      taskId: string;
    }) {
      if (tid !== taskId) return;
      setComments((prev) => {
        if (prev.find((c) => c.id === comment.id)) return prev;
        return [...prev, comment];
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

    socket.on("comment:added", onCommentAdded);
    socket.on("comment:deleted", onCommentDeleted);
    return () => {
      socket.off("comment:added", onCommentAdded);
      socket.off("comment:deleted", onCommentDeleted);
    };
  }, [socket, taskId]);

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

    // Optimistic add
    setComments((prev) => [...prev, optimistic]);
    setContent("");

    try {
      const res = await api.post(
        `/api/projects/${projectId}/tasks/${taskId}/comments`,
        { content: optimistic.content },
      );
      // Replace optimistic with real
      setComments((prev) =>
        prev.map((c) => (c.id === optimistic.id ? res.data.data : c)),
      );
    } catch {
      // Rollback
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setContent(optimistic.content);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await api.delete(
        `/api/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
      );
    } catch {
      // Refetch if delete fails
      setIsLoading(true);
      try {
        const res = await api.get(
          `/api/projects/${projectId}/tasks/${taskId}/comments`,
        );
        setComments(res.data.data);
      } finally {
        setIsLoading(false);
      }
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
