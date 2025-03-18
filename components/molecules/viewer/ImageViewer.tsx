import theme from '@/constants/theme';
import { Image } from 'expo-image';
import { Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  image: string;
}

const ImageViewer = ({ open, onClose, image }: ImageViewerProps) => {
  return (
    <Modal visible={open} transparent={true} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.background}>
          <Image source={{ uri: image }} style={styles.image} contentFit="contain" />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ImageViewer;

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.colors.black[900],
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 2,
    backgroundColor: theme.colors.white[900],
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
  image: {
    width: '100%',
    height: '100%',
    maxHeight: '80%'
  },
  closeText: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '500',
    color: '#000'
  }
});
