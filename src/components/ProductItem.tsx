// components/ProductItem.tsx - VERSI SIMPLIFIED
import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { Product } from '../../types/Product';
import { responsiveValue } from '../utils/responsive';

interface ProductItemProps {
    product: Product;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }): React.JSX.Element => {
    const { width } = useWindowDimensions();

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getResponsiveStyles = () => {
        const numColumns = responsiveValue({
            xs: 1,
            sm: 1,
            md: 2,
            lg: 3,
            default: 1,
        });

        // Untuk multi-column layout, gunakan layout vertikal
        const isMultiColumn = numColumns > 1;

        const imageSize = responsiveValue({
            xs: 60,
            sm: 70,
            md: isMultiColumn ? 120 : 100,
            lg: isMultiColumn ? 140 : 120,
            default: 80,
        });

        return StyleSheet.create({
            container: {
                backgroundColor: 'white',
                borderRadius: 8,
                padding: responsiveValue({
                    xs: 8,
                    sm: 10,
                    default: 12,
                }),
                marginBottom: responsiveValue({
                    xs: 8,
                    sm: 10,
                    default: 12,
                }),
                flexDirection: 'column', // Selalu column untuk konsistensi
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                flex: isMultiColumn ? 1 : undefined,
                margin: isMultiColumn ? 4 : 0,
                width: isMultiColumn ? '100%' : undefined,
            },
            image: {
                width: imageSize,
                height: imageSize,
                borderRadius: 8,
                marginBottom: 8,
                alignSelf: 'center',
            },
            info: {
                flex: 1,
                justifyContent: 'center',
            },
            name: {
                fontSize: responsiveValue({
                    xs: 14,
                    sm: 15,
                    default: 16,
                }),
                fontWeight: 'bold',
                color: '#333',
                marginBottom: 4,
                textAlign: 'center',
            },
            price: {
                fontSize: responsiveValue({
                    xs: 12,
                    sm: 13,
                    default: 14,
                }),
                fontWeight: '600',
                color: '#007AFF',
                marginBottom: 4,
                textAlign: 'center',
            },
            description: {
                fontSize: responsiveValue({
                    xs: 10,
                    sm: 11,
                    default: 12,
                }),
                color: '#666',
                lineHeight: 16,
                textAlign: 'center',
            },
        });
    };

    const styles = getResponsiveStyles();

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: product.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
                <Text style={styles.description} numberOfLines={2}>
                    {product.description}
                </Text>
            </View>
        </View>
    );
};

export default ProductItem;