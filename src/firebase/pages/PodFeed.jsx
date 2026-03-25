import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function PodFeed({ podId }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // This is the magic line — onSnapshot keeps listening forever
    const q = query(
      collection(db, "pods", podId, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(newPosts);
    });

    // When you leave the page, stop listening (important!)
    return () => unsubscribe();
  }, [podId]);

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}