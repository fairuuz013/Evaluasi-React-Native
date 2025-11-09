import React from 'react';
import {
    View,
    FlatList,
    Text,
    StyleSheet,
    ListRenderItem,
} from 'react-native';
import { Product } from '../types/Product';
import ProductItem from './ProductItem';
import { useTheme } from '../context/ThemeContext';

interface ProductListProps {
    products: Product[];
    onProductPress?: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onProductPress }): React.JSX.Element => {
    const { isDark } = useTheme();
    const styles = getStyles(isDark);

    const renderProductItem: ListRenderItem<Product> = ({ item }) => (
        <ProductItem
            product={item}
            onPress={() => onProductPress?.(item)}
        />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Our Products ({products.length})</Text>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={renderProductItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: isDark ? '#121212' : '#f5f5f5',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: isDark ? '#fff' : '#333',
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 100,
    },
});

export default ProductList;