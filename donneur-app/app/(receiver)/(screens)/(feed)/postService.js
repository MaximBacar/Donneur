import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  onSnapshot,
  increment,
} from "firebase/firestore";
import { database } from "../../../../config/firebase";
import { useAuth } from "../../../../context/authContext";

/** ──────────────────────────────────────────────────────
 *  1) Real-time subscription to posts (partial real-time for feed)
 */
export const subscribeToPosts = (onPostsChange, onError) => {
  const q = query(collection(database, "posts"), orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onPostsChange(posts);
    },
    (error) => {
      console.error("Error listening to posts:", error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};

/** ──────────────────────────────────────────────────────
 *  2) One-time fetch of all posts (no real-time)
 */
export const fetchPostsOnce = async () => {
  const q = query(collection(database, "posts"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

/** ──────────────────────────────────────────────────────
 *  3) Fetch a single post by ID (no real-time)
 */
export const fetchPostById = async (postId) => {
  const docRef = doc(database, "posts", postId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    throw new Error("No post found with ID: " + postId);
  }
  return { id: snapshot.id, ...snapshot.data() };
};

/** ──────────────────────────────────────────────────────
 *  4) Hook to Add a Post (init likedBy = [], commentCount = 0)
 */
export const useAddPost = () => {
  const { user } = useAuth();
  return async (text, image) => {
    if (!user) throw new Error("User not authenticated");
    await addDoc(collection(database, "posts"), {
      name: user.uid,
      text: text,
      timestamp: serverTimestamp(),
      avatar: user.photoURL || "https://i.pravatar.cc/300",
      image: image ?? null,
      likedBy: [],
      commentCount: 0, // new posts start with 0 comments
    });
  };
};

/** ──────────────────────────────────────────────────────
 *  5) Hook to Delete a Post
 */
export const useDeletePost = () => {
  const { user } = useAuth();
  return async (post) => {
    if (!user) throw new Error("User not authenticated");
    if (post.name !== user.uid) {
      throw new Error("You are not the owner of this post.");
    }
    await deleteDoc(doc(database, "posts", post.id));
  };
};

/** ──────────────────────────────────────────────────────
 *  6) Hook to Toggle Like for a Post
 */
export const useToggleLike = () => {
  const { user } = useAuth();
  return async (post) => {
    if (!user) throw new Error("User not authenticated");

    const postRef = doc(database, "posts", post.id);
    const isLiked = post.likedBy?.includes(user.uid);

    await updateDoc(postRef, {
      likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };
};

/** ──────────────────────────────────────────────────────
 *  (Optional) Get user profile by UID
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(database, "users", uid));
    return userDoc.exists() ? userDoc.data() : { displayName: "Unknown User" };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { displayName: "Unknown User" };
  }
};

/** ──────────────────────────────────────────────────────
 *  (Optional) Batch fetch multiple user profiles
 */
export const getBatchUserProfiles = async (uids) => {
  const uniqueUids = [...new Set(uids)];
  const profiles = {};
  await Promise.all(
    uniqueUids.map(async (uid) => {
      const profile = await getUserProfile(uid);
      profiles[uid] = profile;
    })
  );
  return profiles;
};

/** ──────────────────────────────────────────────────────
 *  "Responses" (comments) for each post
 */

// 7) Fetch all responses
export const fetchResponses = async (postId) => {
  const responsesRef = collection(doc(database, "posts", postId), "responses");
  const q = query(responsesRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

// 8) Add a new response (only userId stored)
//     => Also increments "commentCount" on the post doc
export const addResponse = async (postId, user, text) => {
  if (!user) throw new Error("User not authenticated");
  const responsesRef = collection(doc(database, "posts", postId), "responses");
  const newDoc = await addDoc(responsesRef, {
    userId: user.uid,
    text: text,
    timestamp: serverTimestamp(),
    likedBy: [],
  });
  // => IMPORTANT: increment "commentCount" in the post doc
  await incrementCommentCount(postId);
  return { id: newDoc.id, userId: user.uid, text };
};

// 9) Hook to toggle like on a response
export const useToggleResponseLike = (postId) => {
  const { user } = useAuth();
  return async (response) => {
    if (!user) throw new Error("User not authenticated");

    const responseRef = doc(
      database,
      "posts",
      postId,
      "responses",
      response.id
    );
    const isLiked = response.likedBy?.includes(user.uid);

    await updateDoc(responseRef, {
      likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };
};

// 10) Delete a response (and decrement commentCount)
export const deleteResponse = async (postId, user, response) => {
  if (!user) throw new Error("User not authenticated");
  if (response.userId !== user.uid) {
    throw new Error("You are not the owner of this comment.");
  }
  const responseRef = doc(database, "posts", postId, "responses", response.id);
  await deleteDoc(responseRef);

  // => IMPORTANT: decrement "commentCount" in the post doc
  await decrementCommentCount(postId);
};

// 11) Real-time subscription for response likes only
export const subscribeToResponses = (postId, onModified, onError) => {
  const responsesRef = collection(doc(database, "posts", postId), "responses");
  const q = query(responsesRef, orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const updatedComment = { id: change.doc.id, ...change.doc.data() };
          onModified(updatedComment);
        }
      });
    },
    (error) => {
      console.error("Error listening to responses:", error);
      if (onError) onError(error);
    }
  );
  return unsubscribe;
};

// Manage commentCount in post doc
export const incrementCommentCount = async (postId) => {
  const postRef = doc(database, "posts", postId);
  await updateDoc(postRef, { commentCount: increment(1) });
};
export const decrementCommentCount = async (postId) => {
  const postRef = doc(database, "posts", postId);
  await updateDoc(postRef, { commentCount: increment(-1) });
};

/** ──────────────────────────────────────────────────────
 *  "Answers" for each comment => /posts/{postId}/responses/{commentId}/answers/{answerId}
 *  Single-level "reply" logic
 */

// 12) Fetch all answers for a single comment
export const fetchAnswers = async (postId, commentId) => {
  const answersRef = collection(
    doc(database, "posts", postId, "responses", commentId),
    "answers"
  );
  const q = query(answersRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
};

// 13) Add a new answer (only userId stored)
//     => Optionally increments "answerCount" on the comment doc
export const addAnswer = async (postId, commentId, user, text) => {
  if (!user) throw new Error("User not authenticated");
  const answersRef = collection(
    doc(database, "posts", postId, "responses", commentId),
    "answers"
  );
  const newDoc = await addDoc(answersRef, {
    userId: user.uid,
    text,
    timestamp: serverTimestamp(),
    likedBy: [],
  });
  // => increment "answerCount" on that comment doc (optional)
  await incrementAnswerCountInComment(postId, commentId);
  return { id: newDoc.id, userId: user.uid, text };
};

// 14) Hook to toggle like on an answer
export const useToggleAnswerLike = (postId, commentId) => {
  const { user } = useAuth();
  return async (answer) => {
    if (!user) throw new Error("User not authenticated");
    const answerRef = doc(
      database,
      "posts",
      postId,
      "responses",
      commentId,
      "answers",
      answer.id
    );
    const isLiked = answer.likedBy?.includes(user.uid);
    await updateDoc(answerRef, {
      likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };
};

// Corrected: Delete an answer (and decrement answerCount)
export const deleteAnswer = async (postId, user, commentId, answer) => {
  if (!user) throw new Error("User not authenticated");
  if (answer.userId !== user.uid) {
    throw new Error("You are not the owner of this answer.");
  }

  // correct path to the answer
  const answerRef = doc(
    database,
    "posts",
    postId,
    "responses",
    commentId,
    "answers",
    answer.id
  );

  // delete the answer
  await deleteDoc(answerRef);

  // decrement answer count in the comment doc
  await decrementAnswerCountInComment(postId, commentId);
};

// 16) Partial real-time subscription for answers => only "modified"
export const subscribeToAnswers = (postId, commentId, onModified, onError) => {
  const answersRef = collection(
    doc(database, "posts", postId, "responses", commentId),
    "answers"
  );
  const q = query(answersRef, orderBy("timestamp", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const updatedAnswer = {
            id: change.doc.id,
            ...change.doc.data(),
          };
          onModified(updatedAnswer);
        }
      });
    },
    (error) => {
      console.error("Error listening to answers:", error);
      if (onError) onError(error);
    }
  );
  return unsubscribe;
};

// Track "answerCount" in each comment doc
export const incrementAnswerCountInComment = async (postId, commentId) => {
  const commentRef = doc(database, "posts", postId, "responses", commentId);
  await updateDoc(commentRef, { answerCount: increment(1) });
};
export const decrementAnswerCountInComment = async (postId, commentId) => {
  const commentRef = doc(database, "posts", postId, "responses", commentId);
  await updateDoc(commentRef, { answerCount: increment(-1) });
};

export const fetchCommentById = async (postId, commentId) => {
  const commentRef = doc(database, "posts", postId, "responses", commentId);
  const snapshot = await getDoc(commentRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  } else {
    throw new Error("No comment found with ID: " + commentId);
  }
};
