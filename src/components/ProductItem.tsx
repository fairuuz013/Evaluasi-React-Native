import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Product } from '../types/Product';

interface ProductItemProps {
    product: Product;
    onPress?: () => void;
}

const ProductItem: React.FC<ProductItemProps> = ({ product, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image
                source={{ uri: product.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>${product.price}</Text>
                {product.description ? (
                    <Text style={styles.description} numberOfLines={2}>
                        {product.description}
                    </Text>
                ) : null}
            </View>
            <View style={styles.arrow}>
                <Text style={styles.arrowText}>›</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 16,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: '#007AFF',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 18,
    },
    arrow: {
        paddingLeft: 10,
    },
    arrowText: {
        fontSize: 20,
        color: '#ccc',
        fontWeight: 'bold',
    },
});

export default ProductItem;