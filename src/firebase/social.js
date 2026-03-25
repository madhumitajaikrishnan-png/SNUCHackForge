import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "./config";

// ── FEED & POSTS ─────────────────────────────────────────────────────────────

export function listenToPodFeed(podId, callback) {
  // Listen to posts for a specific pod, ordered by newest first
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).filter(post => post.podId === podId); // In a real app, query by podId directly (needs Firestore index)
    
    callback(posts);
  });
}

export async function addProofPost(uid, podId, user, initials, time, habit, msg, type, cred, streak) {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      uid,
      podId,
      user,
      initials,
      time,
      habit,
      msg,
      type, // "full", "ghost", "halfway"
      cred,
      streak,
      vouchedBy: [],
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding post: ", e);
  }
}

export async function vouchForPost(postId, myUid) {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      vouchedBy: arrayUnion(myUid)
    });
  } catch (e) {
    console.error("Error vouching for post: ", e);
  }
}

// ── LEADERBOARD & USERS ──────────────────────────────────────────────────────

export function listenToLeaderboard(podId, callback) {
  // Listen to users in a pod, ordered by credibility descending
  const q = query(collection(db, "users"), orderBy("cred", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).filter(user => user.podId === podId); 
    
    callback(users);
  });
}

export async function toggleGhostMode(uid, isGhost) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      status: isGhost ? "ghost" : "done"
    });
  } catch (e) {
    console.error("Error toggling Ghost Mode: ", e);
  }
}
