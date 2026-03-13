import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Pressable, Text } from 'react-native';
import { Plus, UserPlus, FilePlus, PackagePlus, X } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

export default function QuickActionMenu() {
    const navigation = useNavigation();
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;
        Animated.spring(animation, {
            toValue,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
        }).start();
        setIsOpen(!isOpen);
    };

    const getButtonStyle = (direction) => {
        let translateX = 0;
        let translateY = 0;

        const distanceH = 100; // Distancia Horizontal
        const distanceV = 85;  // Distancia Vertical (Norte)
        const curveV = 35;     // Elevación para Oeste/Este (Curvatura)

        if (direction === 'north') {
            translateY = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -distanceV - 20],
            });
        } else if (direction === 'west') {
            translateX = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -distanceH],
            });
            translateY = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -curveV], // Ligeramente por encima del margen
            });
        } else if (direction === 'east') {
            translateX = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, distanceH],
            });
            translateY = animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -curveV], // Ligeramente por encima del margen
            });
        }

        const scale = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        const opacity = animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0, 1],
        });

        return {
            transform: [{ translateX }, { translateY }, { scale }],
            opacity,
        };
    };

    const rotation = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '135deg'], // De + a X con más giro
    });

    const handleAction = (screen, params = {}) => {
        toggleMenu();
        navigation.navigate(screen, params);
    };

    return (
        <View style={styles.container}>
            {isOpen && (
                <Pressable style={styles.overlay} onPress={toggleMenu} />
            )}

            {/* Burbujas de acción (Norte, Oeste, Este) */}
            <Animated.View style={[styles.actionButton, getButtonStyle('east')]}>
                <TouchableOpacity 
                    activeOpacity={0.7}
                    style={[styles.button, styles.secondaryButton]} 
                    onPress={() => handleAction('ProductEdit', { mode: 'create' })}
                >
                    <PackagePlus color={COLORS.text} size={24} />
                </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.actionButton, getButtonStyle('west')]}>
                <TouchableOpacity 
                    activeOpacity={0.7}
                    style={[styles.button, styles.secondaryButton]} 
                    onPress={() => handleAction('ClientEdit', { mode: 'create' })}
                >
                    <UserPlus color={COLORS.text} size={24} />
                </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.actionButton, getButtonStyle('north')]}>
                <TouchableOpacity 
                    activeOpacity={0.7}
                    style={[styles.button, styles.secondaryButton]} 
                    onPress={() => handleAction('NewInvoice')}
                >
                    <FilePlus color={COLORS.text} size={24} />
                </TouchableOpacity>
            </Animated.View>

            {/* Botón Principal (Sobresale un poco) */}
            <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={toggleMenu} 
                style={[styles.button, styles.mainButton]}
            >
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <Plus color="white" size={32} strokeWidth={2.5} />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    overlay: {
        position: 'absolute',
        width: 2000,
        height: 2000,
        bottom: -500,
        backgroundColor: 'transparent',
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 12,
    },
    mainButton: {
        backgroundColor: COLORS.primary,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: 10, // Para que sobresalga un poco más hacia arriba
    },
    secondaryButton: {
        backgroundColor: 'rgba(15, 23, 42, 0.98)',
        borderWidth: 1.5,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    actionButton: {
        position: 'absolute',
        zIndex: 90,
    },
});
