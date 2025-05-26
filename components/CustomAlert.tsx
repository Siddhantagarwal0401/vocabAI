import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

export interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive' | 'primary'; 
}

interface CustomAlertProps {
  isVisible: boolean;
  title: string;
  message?: string;
  buttons: AlertButton[];
  onRequestClose: () => void; // For Android back button or to close via overlay press
}

const CustomAlert: React.FC<CustomAlertProps> = ({ 
  isVisible, 
  title, 
  message, 
  buttons, 
  onRequestClose 
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onRequestClose} 
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onRequestClose}>
        <TouchableOpacity activeOpacity={1} style={styles.alertBox} onPress={() => { /* Prevent closing when pressing inside alert box */ }}>
          <Text style={styles.titleText}>{title}</Text>
          {message && <Text style={styles.messageText}>{message}</Text>}
          
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button, // Base style for all buttons
                  button.style === 'destructive' ? styles.destructiveButton :
                  button.style === 'cancel' ? styles.cancelButton :
                  button.style === 'primary' ? styles.primaryButton :
                  styles.defaultButton,
                  // Layout specific styles:
                  buttons.length > 2 ? styles.stackedButton : null, // Stack if more than 2 buttons
                  buttons.length === 1 ? styles.singleButton : null, // Special styling for a single button
                  (buttons.length === 2 && index === 0) ? styles.firstButtonMargin : null, // First of two side-by-side buttons
                  // If buttons.length is 2, styles.button with flex:1 handles side-by-side layout automatically.
                  // If buttons.length > 2, stackedButton applies width 100%.
                  // If buttons.length is 1, singleButton applies (e.g. no left border).
                ]}
                onPress={() => {
                  button.onPress();
                }}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'destructive' ? styles.destructiveButtonText :
                  button.style === 'cancel' ? styles.cancelButtonText :
                  button.style === 'primary' ? styles.primaryButtonText :
                  styles.defaultButtonText,
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Darker overlay for more focus
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertBox: {
    width: '100%',
    maxWidth: screenWidth * 0.85, 
    backgroundColor: '#2C2C2E', // Matches modern iOS dark mode alerts
    borderRadius: 14, // Standard iOS alert corner radius
    paddingTop: 20, // More space at the top
    paddingBottom: 0, // Buttons will have their own padding
    paddingHorizontal: 0, // Inner content will manage its padding
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },
  titleText: {
    fontSize: 18, // Slightly larger title
    fontWeight: '600', // Semibold for title
    color: '#F2F2F7',
    textAlign: 'center',
    marginBottom: 6, // Reduced margin if there's a message
    paddingHorizontal: 16, // Padding for title text
  },
  messageText: {
    fontSize: 14, // Standard message size
    color: '#E5E5EA',
    textAlign: 'center',
    marginBottom: 20, // Space before buttons
    lineHeight: 18, // Improved readability
    paddingHorizontal: 16, // Padding for message text
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(142, 142, 147, 0.5)', // Subtle separator like iOS
  },
  button: {
    flex: 1, // Each button takes equal width if side-by-side
    paddingVertical: 14, // Taller tap area
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: 'rgba(142, 142, 147, 0.5)', // Separator for side-by-side buttons
  },
  firstButtonMargin: { // Applied to the first button if there are multiple side-by-side
    borderLeftWidth: 0, // No left border for the very first button
  },
  stackedButton: { // When more than 2 buttons, they stack
    width: '100%',
    borderLeftWidth: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(142, 142, 147, 0.5)',
  },
  singleButton: { // If only one button, it takes full width
    borderLeftWidth: 0,
  },
  buttonText: { // Base style for all button texts
    fontSize: 17, // Standard iOS alert button text size
    textAlign: 'center',
  },
  defaultButtonText: {
    color: '#0A84FF', // iOS blue
    fontWeight: '400',
  },
  primaryButtonText: {
    color: '#0A84FF',
    fontWeight: '600', // Semibold for primary actions
  },
  cancelButtonText: {
    color: '#0A84FF',
    fontWeight: '600', // Also semibold for cancel, as per iOS style
  },
  destructiveButtonText: {
    color: '#FF3B30', // iOS red
    fontWeight: '400',
  },
  // Removed specific button background colors, relying on text color for intent
  // and transparent background for buttons to blend with alertBox bottom.
  // If distinct button backgrounds are needed, they can be added back here.
  defaultButton: {},
  primaryButton: {},
  cancelButton: {},
  destructiveButton: {},
});

export default CustomAlert;
