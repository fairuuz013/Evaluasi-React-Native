// components/ProductList.tsx
import React from 'react';
import {
    View,
    FlatList,
    Text,
    StyleSheet,
    ListRenderItem,
} from 'react-native';
import { Product } from '../../types/Product';
import ProductItem from './ProductItem';

interface ProductListProps {
    products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }): React.JSX.Element => {
    const renderProductItem: ListRenderItem<Product> = ({ item }) => (
        <ProductItem product={item} />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Products ({products.length})</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    listContent: {
        paddingBottom: 20,
    },
});

export default ProductList;