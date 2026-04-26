import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addToBookshelf } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function BookDetailScreen({ route, navigation }) {
  const { book } = route.params;
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [showListPicker, setShowListPicker] = useState(false);

  const handleAddToBookshelf = async (listType) => {
    setAdding(true);
    setShowListPicker(false);
    try {
      await addToBookshelf(book._id, listType);
      Alert.alert('Added!', `"${book.title}" added to your ${listType}.`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add to bookshelf';
      Alert.alert('Notice', msg);
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cover */}
      <View style={styles.coverContainer}>
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="book" size={60} color="#fff" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>by {book.author}</Text>
        {book.category && (
          <View style={styles.genreTag}><Text style={styles.genreTagText}>{book.category}</Text></View>
        )}

        <Text style={styles.descLabel}>Description</Text>
        <Text style={styles.desc}>{book.description || 'No description available.'}</Text>

        {/* Action buttons */}
        <TouchableOpacity
          style={styles.readBtn}
          onPress={() => navigation.navigate('Reader', { 
            bookId: book._id, 
            bookTitle: book.title, 
            pdfUrl: book.pdfUrl,
            totalPages: book.totalPages || 0
          })}
        >
          <Ionicons name="book-outline" size={18} color="#fff" />
          <Text style={styles.readBtnText}>Read Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookshelfBtn}
          onPress={() => setShowListPicker(true)}
          disabled={adding}
        >
          <Ionicons name="bookmark-outline" size={18} color="#1e3a5f" />
          <Text style={styles.bookshelfBtnText}>{adding ? 'Adding…' : 'Add to Bookshelf'}</Text>
        </TouchableOpacity>

        {/* Admin actions */}
        {user?.role === 'admin' && (
          <View style={styles.adminRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditBook', { book })}
            >
              <Ionicons name="create-outline" size={16} color="#fff" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* List picker modal */}
      {showListPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Add to which list?</Text>
            {['favourites', 'reading', 'wishlist'].map((list) => (
              <TouchableOpacity
                key={list}
                style={styles.pickerOption}
                onPress={() => handleAddToBookshelf(list)}
              >
                <Ionicons
                  name={list === 'favourites' ? 'heart-outline' : list === 'reading' ? 'glasses-outline' : 'time-outline'}
                  size={20} color="#1e3a5f"
                />
                <Text style={styles.pickerOptionText}>{list.charAt(0).toUpperCase() + list.slice(1)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setShowListPicker(false)}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { paddingBottom: 40 },
  coverContainer: { backgroundColor: '#1e3a5f', alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  cover: { width: 160, height: 220, borderRadius: 10 },
  coverPlaceholder: { width: 160, height: 220, borderRadius: 10, backgroundColor: '#2d5580', justifyContent: 'center', alignItems: 'center' },
  infoCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  author: { fontSize: 15, color: '#666', marginTop: 6 },
  genreTag: { alignSelf: 'flex-start', backgroundColor: '#e8f0fe', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginTop: 10 },
  genreTagText: { fontSize: 12, color: '#1e3a5f', fontWeight: '600' },
  descLabel: { fontSize: 14, fontWeight: '700', color: '#1e3a5f', marginTop: 20, marginBottom: 8 },
  desc: { fontSize: 14, color: '#555', lineHeight: 22 },
  readBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1e3a5f', borderRadius: 12, paddingVertical: 14, marginTop: 24 },
  readBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  bookshelfBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#1e3a5f', borderRadius: 12, paddingVertical: 13, marginTop: 10 },
  bookshelfBtnText: { color: '#1e3a5f', fontWeight: '700', fontSize: 15 },
  adminRow: { flexDirection: 'row', marginTop: 10, gap: 10 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2e7d32', borderRadius: 10, paddingVertical: 11 },
  editBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  pickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  pickerCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%' },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: '#1e3a5f', marginBottom: 16 },
  pickerOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  pickerOptionText: { fontSize: 15, color: '#333' },
  pickerCancel: { paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  pickerCancelText: { color: '#888', fontWeight: '600' },
});
