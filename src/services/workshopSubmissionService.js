import { db } from '../firebaseDb';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

const WORKSHOP_SUBMISSIONS = 'lumiere_workshop_submissions';

export const submitWorkshopApplication = async ({
  user,
  workshop,
  applicantName,
  applicantPhone,
  experience,
  motivation,
}) => {
  if (!user?.uid || !user?.email) {
    throw new Error('Authentication required. Please login again.');
  }

  if (!workshop?.id || !workshop?.name) {
    throw new Error('Workshop details are missing. Please choose a workshop again.');
  }

  if (!applicantName?.trim() || !applicantPhone?.trim() || !motivation?.trim()) {
    throw new Error('Please fill all required workshop fields.');
  }

  const duplicateQuery = query(
    collection(db, WORKSHOP_SUBMISSIONS),
    where('userId', '==', user.uid),
    where('workshopId', '==', workshop.id)
  );

  const duplicateSnapshot = await getDocs(duplicateQuery);
  if (!duplicateSnapshot.empty) {
    throw new Error('You have already submitted for this workshop.');
  }

  const submissionId = `WS-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')}`;

  const payload = {
    submissionId,
    userId: user.uid,
    userEmail: user.email,
    userDisplayName: user.displayName || '',
    workshopId: workshop.id,
    workshopName: workshop.name,
    workshopType: workshop.type || 'Workshop',
    fee: 0,
    paymentRequired: false,
    paymentStatus: 'not-required',
    status: 'submitted',
    applicantName: applicantName.trim(),
    applicantPhone: applicantPhone.trim(),
    experience: experience?.trim() || 'Beginner',
    motivation: motivation.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, WORKSHOP_SUBMISSIONS), payload);

  return {
    success: true,
    id: docRef.id,
    submissionId,
    message: 'Workshop application submitted successfully.',
  };
};

export const getUserWorkshopSubmissions = async (userId) => {
  if (!userId) return [];

  const q = query(
    collection(db, WORKSHOP_SUBMISSIONS),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const submissions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
  }));

  submissions.sort((a, b) => {
    const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return bDate - aDate;
  });

  return submissions;
};
