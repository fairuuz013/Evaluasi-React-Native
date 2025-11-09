import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { ProductForm } from '../types/Product';
import { useTheme } from '../context/ThemeContext';

interface ProductModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (product: ProductForm) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
    visible,
    onClose,
    onSubmit,
}): React.JSX.Element => {
    const [form, setForm] = useState<ProductForm>({
        name: '',
        price: '',
        imageUrl: '',
        description: '',
    });
    const [errors, setErrors] = useState<Partial<ProductForm>>({});
    const { isDark } = useTheme();
    const styles = getStyles(isDark);

    const validateForm = (): boolean => {
        const newErrors: Partial<ProductForm> = {};

        if (!form.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!form.price.trim()) {
            newErrors.price = 'Price is required';
        } else if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
            newErrors.price = 'Price must be a valid number greater than 0';
        }

        if (!form.imageUrl.trim()) {
            newErrors.imageUrl = 'Image URL is required';
        } else if (!/^https?:\/\/.+\..+/.test(form.imageUrl)) {
            newErrors.imageUrl = 'Please enter a valid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (): void => {
        if (validateForm()) {
            onSubmit(form);
            setForm({ name: '', price: '', imageUrl: '', description: '' });
            setErrors({});
        }
    };

    const handleClose = (): void => {
        setForm({ name: '', price: '', imageUrl: '', description: '' });
        setErrors({});
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Add New Product</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Product Name *</Text>
                        <TextInput
                            style={[
                                styles.input,
                                errors.name && styles.inputError
                            ]}
                            value={form.name}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                            placeholder="Enter product name"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Price *</Text>
                        <TextInput
                            style={[
                                styles.input,
                                errors.price && styles.inputError
                            ]}
                            value={form.price}
                            onChangeText={(text) => setForm({ ...form, price: text })}
                            placeholder="Enter price"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            keyboardType="numeric"
                        />
                        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Image URL *</Text>
                        <TextInput
                            style={[
                                styles.input,
                                errors.imageUrl && styles.inputError
                            ]}
                            value={form.imageUrl}
                            onChangeText={(text) => setForm({ ...form, imageUrl: text })}
                            placeholder="Enter image URL"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            autoCapitalize="none"
                        />
                        {errors.imageUrl && <Text style={styles.errorText}>{errors.imageUrl}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                            placeholder="Enter product description"
                            placeholderTextColor={isDark ? '#888' : '#999'}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Add Product</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: isDark ? '#121212' : 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#333' : '#e0e0e0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isDark ? '#fff' : '#333',
    },
    closeButton: {
        fontSize: 20,
        color: isDark ? '#ccc' : '#666',
        padding: 4,
    },
    form: {
        flex: 1,
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: isDark ? '#fff' : '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: isDark ? '#333' : '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: isDark ? '#1e1e1e' : '#f9f9f9',
        color: isDark ? '#fff' : '#333',
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    textArea: {
        minHeight: 80,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: isDark ? '#333' : '#e0e0e0',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#007AFF',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#007AFF',
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProductModal;