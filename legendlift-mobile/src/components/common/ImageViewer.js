import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

/**
 * ImageViewer Component
 *
 * Displays images as thumbnails with fullscreen modal on tap
 *
 * Props:
 * - images: Array of image URLs
 * - title: Section title (e.g., "Completion Images", "Before Images")
 * - emptyMessage: Message when no images
 */
const ImageViewer = ({ images, title = 'Images', emptyMessage = 'No images uploaded' }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Parse images if it's a JSON string
  const parseImages = () => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === 'string') {
      try {
        return JSON.parse(images);
      } catch {
        return [images]; // Single URL string
      }
    }
    return [];
  };

  const imageArray = parseImages();

  if (!imageArray || imageArray.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="image-outline" size={24} color="#999" />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const openFullscreen = (index) => {
    setSelectedImageIndex(index);
    setIsModalVisible(true);
  };

  const closeFullscreen = () => {
    setIsModalVisible(false);
  };

  const goToNext = () => {
    if (selectedImageIndex < imageArray.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Title */}
      <View style={styles.titleContainer}>
        <Ionicons name="images" size={20} color="#007AFF" />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{imageArray.length}</Text>
        </View>
      </View>

      {/* Thumbnail Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailScroll}>
        {imageArray.map((imageUrl, index) => (
          <TouchableOpacity
            key={index}
            style={styles.thumbnailContainer}
            onPress={() => openFullscreen(index)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.thumbnailOverlay}>
              <Ionicons name="expand" size={16} color="#fff" />
            </View>
            <Text style={styles.thumbnailNumber}>{index + 1}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fullscreen Modal */}
      <Modal
        visible={isModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={closeFullscreen}
      >
        <View style={styles.modalContainer}>
          <StatusBar hidden={Platform.OS === 'ios'} />

          {/* Header with Close Button */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeFullscreen} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedImageIndex + 1} / {imageArray.length}
            </Text>
            <View style={{ width: 80 }} />
          </View>

          {/* Fullscreen Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageArray[selectedImageIndex] }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </View>

          {/* Navigation Buttons */}
          {imageArray.length > 1 && (
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                onPress={goToPrevious}
                style={[
                  styles.navButton,
                  selectedImageIndex === 0 && styles.navButtonDisabled,
                ]}
                disabled={selectedImageIndex === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={32}
                  color={selectedImageIndex === 0 ? '#666' : '#fff'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={goToNext}
                style={[
                  styles.navButton,
                  selectedImageIndex === imageArray.length - 1 && styles.navButtonDisabled,
                ]}
                disabled={selectedImageIndex === imageArray.length - 1}
              >
                <Ionicons
                  name="chevron-forward"
                  size={32}
                  color={selectedImageIndex === imageArray.length - 1 ? '#666' : '#fff'}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Info */}
          <View style={styles.bottomInfo}>
            <Text style={styles.bottomInfoText}>{title}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
  },
  emptyText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#999',
  },
  thumbnailScroll: {
    flexDirection: 'row',
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 6,
  },
  thumbnailNumber: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width,
    height: height - 200,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  navButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    padding: 12,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bottomInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
  },
  bottomInfoText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ImageViewer;
