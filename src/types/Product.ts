// types/Product.ts
export interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    description?: string;
}

export interface ProductForm {
    name: string;
    price: string;
    imageUrl: string;
    description: string;
}