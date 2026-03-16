import { db } from '../firebaseDb';
import { 
  collection, 
  doc, 
  addDoc,
  getDocs, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Discount Service
 * Handles discount code generation and validation
 */

// Generate discount code (6 letters + 2 numbers)
const generateDiscountCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  
  // 6 random letters
  for (let i = 0; i < 6; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // 2 random numbers
  code += Math.floor(Math.random() * 10);
  code += Math.floor(Math.random() * 10);
  
  return code;
};

/**
 * Ensure unique discount code
 */
export const generateUniqueDiscountCode = async () => {
  let code = generateDiscountCode();
  let exists = await checkCodeExists(code);
  
  // Keep generating until unique
  while (exists) {
    code = generateDiscountCode();
    exists = await checkCodeExists(code);
  }
  
  return code;
};

/**
 * Check if discount code exists
 */
const checkCodeExists = async (code) => {
  try {
    const q = query(
      collection(db, 'discounts'),
      where('discountCode', '==', code.toUpperCase())
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking code:', error);
    return false;
  }
};

/**
 * Create a new discount code (Admin only)
 */
export const createDiscount = async (discountData, adminEmail) => {
  try {
    const discountCode = await generateUniqueDiscountCode();

    const discount = {
      discountCode,
      adminEmail: adminEmail || '',
      userEmail: discountData.userEmail.toLowerCase().trim(),
      eventId: discountData.eventId || 'all',
      eventName: discountData.eventName || 'All Events',
      discountAmount: Number(discountData.discountAmount) || 0,
      isUsed: false,
      usedAt: null,
      createdAt: serverTimestamp(),
      expiresAt: discountData.expiresAt || null
    };

    const docRef = await addDoc(collection(db, 'discounts'), discount);

    return { 
      success: true, 
      id: docRef.id, 
      discountCode,
      discount 
    };
  } catch (error) {
    console.error('Error creating discount:', error);
    throw error;
  }
};

/**
 * Validate discount code
 */
export const validateDiscount = async (discountCode, userEmail, eventId) => {
  try {
    const code = discountCode.toUpperCase().trim();
    const email = userEmail.toLowerCase().trim();

    // Find discount by code
    const q = query(
      collection(db, 'discounts'),
      where('discountCode', '==', code)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Invalid discount code');
    }

    const discountDoc = querySnapshot.docs[0];
    const discount = discountDoc.data();

    // Check if already used
    if (discount.isUsed) {
      throw new Error('This discount code has already been used');
    }

    // Check if expired
    if (discount.expiresAt) {
      const expiryDate = discount.expiresAt.toDate?.() || new Date(discount.expiresAt);
      if (new Date() > expiryDate) {
        throw new Error('This discount code has expired');
      }
    }

    // Check if user email matches
    if (discount.userEmail !== email) {
      throw new Error('This discount code is not valid for your account');
    }

    // Check if event matches (if not 'all')
    if (discount.eventId !== 'all' && discount.eventId !== eventId) {
      throw new Error('This discount code is not valid for this event');
    }

    return {
      valid: true,
      discountAmount: discount.discountAmount,
      discountCode: code,
      id: discountDoc.id
    };
  } catch (error) {
    console.error('Error validating discount:', error);
    throw error;
  }
};

/**
 * Mark discount as used
 */
export const markDiscountAsUsed = async (discountDocId) => {
  try {
    const discountRef = doc(db, 'discounts', discountDocId);
    
    await updateDoc(discountRef, {
      isUsed: true,
      usedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking discount as used:', error);
    throw error;
  }
};

/**
 * Get all discounts (Admin)
 */
export const getAllDiscounts = async (filters = {}) => {
  try {
    let q = query(collection(db, 'discounts'), orderBy('createdAt', 'desc'));

    // Apply filters
    if (filters.userEmail) {
      q = query(
        collection(db, 'discounts'),
        where('userEmail', '==', filters.userEmail.toLowerCase()),
        orderBy('createdAt', 'desc')
      );
    } else if (filters.eventId) {
      q = query(
        collection(db, 'discounts'),
        where('eventId', '==', filters.eventId),
        orderBy('createdAt', 'desc')
      );
    } else if (filters.isUsed !== undefined) {
      q = query(
        collection(db, 'discounts'),
        where('isUsed', '==', filters.isUsed),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const discounts = [];

    querySnapshot.forEach((doc) => {
      discounts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        usedAt: doc.data().usedAt?.toDate?.() || doc.data().usedAt,
        expiresAt: doc.data().expiresAt?.toDate?.() || doc.data().expiresAt,
      });
    });

    return discounts;
  } catch (error) {
    console.error('Error getting discounts:', error);
    throw error;
  }
};

/**
 * Get discounts for a user
 */
export const getUserDiscounts = async (userEmail) => {
  try {
    const q = query(
      collection(db, 'discounts'),
      where('userEmail', '==', userEmail.toLowerCase()),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const discounts = [];

    querySnapshot.forEach((doc) => {
      discounts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        usedAt: doc.data().usedAt?.toDate?.() || doc.data().usedAt,
        expiresAt: doc.data().expiresAt?.toDate?.() || doc.data().expiresAt,
      });
    });

    return discounts;
  } catch (error) {
    console.error('Error getting user discounts:', error);
    throw error;
  }
};

/**
 * Delete discount (Admin only)
 */
export const deleteDiscount = async (discountDocId) => {
  try {
    await deleteDoc(doc(db, 'discounts', discountDocId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting discount:', error);
    throw error;
  }
};

/**
 * Get discount statistics (Admin)
 */
export const getDiscountStats = async () => {
  try {
    const q = query(collection(db, 'discounts'));
    const querySnapshot = await getDocs(q);
    
    const stats = {
      total: 0,
      used: 0,
      unused: 0,
      expired: 0,
      totalAmountIssued: 0,
      totalAmountUsed: 0
    };

    const now = new Date();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      stats.total++;
      stats.totalAmountIssued += data.discountAmount || 0;

      if (data.isUsed) {
        stats.used++;
        stats.totalAmountUsed += data.discountAmount || 0;
      } else {
        stats.unused++;
        
        // Check if expired
        if (data.expiresAt) {
          const expiryDate = data.expiresAt.toDate?.() || new Date(data.expiresAt);
          if (now > expiryDate) {
            stats.expired++;
          }
        }
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting discount stats:', error);
    throw error;
  }
};
