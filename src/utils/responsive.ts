// utils/responsive.ts
import { Dimensions, ScaledSize } from 'react-native';

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const getScreenSize = (): ScreenSize => {
    const { width, height } = Dimensions.get('window');
    const minDimension = Math.min(width, height);

    if (minDimension < 375) return 'xs';
    if (minDimension < 768) return 'sm';
    if (minDimension < 1024) return 'md';
    if (minDimension < 1280) return 'lg';
    return 'xl';
};

export const isTablet = (): boolean => {
    const { width, height } = Dimensions.get('window');
    const minDimension = Math.min(width, height);
    return minDimension >= 768;
};

export const isLandscape = (): boolean => {
    const { width, height } = Dimensions.get('window');
    return width > height;
};

export const responsiveValue = <T>(
    values: {
        xs?: T;
        sm?: T;
        md?: T;
        lg?: T;
        xl?: T;
        default: T;
    }
): T => {
    const size = getScreenSize();
    return values[size] || values.default;
};

export const getOrientationAwareDimensions = () => {
    const { width, height } = Dimensions.get('window');
    return {
        width,
        height,
        isLandscape: width > height,
        isPortrait: width <= height
    };
};