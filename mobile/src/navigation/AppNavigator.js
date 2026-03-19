import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, FileText, Users, Box, LogIn } from 'lucide-react-native';

// Pantallas
import DashboardScreen from '../screens/DashboardScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import ClientsScreen from '../screens/ClientsScreen';
import InventoryScreen from '../screens/InventoryScreen';
import NewInvoiceScreen from '../screens/NewInvoiceScreen';
import InvoiceDetailScreen from '../screens/InvoiceDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ConfirmationSuccessScreen from '../screens/ConfirmationSuccessScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import CreateBusinessScreen from '../screens/CreateBusinessScreen';
import ProductEditScreen from '../screens/ProductEditScreen';
import ClientDashboardScreen from '../screens/ClientDashboardScreen';
import ClientEditScreen from '../screens/ClientEditScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BusinessEditScreen from '../screens/BusinessEditScreen';
import UserEditScreen from '../screens/UserEditScreen';

import { COLORS, PREMIUM_COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import QuickActionMenu from '../components/QuickActionMenu';

import { Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_MARGIN = 14; 
const TAB_BAR_WIDTH_CALC = SCREEN_WIDTH - (TAB_BAR_MARGIN * 2);
const TAB_COUNT = 5; 
const TAB_WIDTH = TAB_BAR_WIDTH_CALC / TAB_COUNT;

function CustomTabBar({ state, descriptors, navigation }) {
    const translateX = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.spring(translateX, {
            toValue: state.index * TAB_WIDTH,
            useNativeDriver: false,
            tension: 40,
            friction: 8
        }).start();
    }, [state.index]);

    // Interpolación de Ancho Adaptativo (Morfosis)
    const bubbleWidth = translateX.interpolate({
        inputRange: [0, TAB_WIDTH, 2 * TAB_WIDTH, 3 * TAB_WIDTH, 4 * TAB_WIDTH],
        outputRange: [
            TAB_WIDTH,                  // Dashboard
            (TAB_WIDTH * 1.5) - 7,      // Facturas (se estira hasta el centro)
            TAB_WIDTH - 14,             // Placeholder
            (TAB_WIDTH * 1.5) - 7,      // Clientes (se estira hasta el centro)
            TAB_WIDTH                   // Inventario
        ],
    });

    const bubbleOffset = translateX.interpolate({
        inputRange: [0, TAB_WIDTH, 2 * TAB_WIDTH, 3 * TAB_WIDTH, 4 * TAB_WIDTH],
        outputRange: [
            0,                                      // Dashboard
            7,                                      // Facturas (inicia normal, se estira a la der)
            7,                                      // Placeholder
            -(TAB_WIDTH * 0.5) + 7,                 // Clientes (inicia desde el centro, se estira a la izq)
            0                                       // Inventario
        ],
    });

    return (
        <View style={styles.tabBarContainer}>

            {/* Burbuja Dinámica */}
            <Animated.View 
                style={[
                    styles.tabIndicator, 
                    { 
                        width: bubbleWidth,
                        transform: [{ translateX: Animated.add(translateX, bubbleOffset) }] 
                    }
                ]} 
            >
                <View style={styles.indicatorInner} />
            </Animated.View>
            
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                if (route.name === 'Placeholder') {
                    return <View key={route.key} style={{ width: TAB_WIDTH }} />;
                }

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        style={styles.tabItem}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconWrapper}>
                            {options.tabBarIcon({ 
                                color: isFocused ? COLORS.success : COLORS.textSecondary, 
                                size: 21 
                            })}
                        </View>
                        <Text 
                            numberOfLines={1} 
                            style={[
                                styles.tabLabel, 
                                { color: isFocused ? COLORS.success : COLORS.textSecondary }
                            ]}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function TabNavigator() {
    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Tab.Navigator
                tabBar={props => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Dashboard"
                    component={DashboardScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
                    }}
                />
                <Tab.Screen
                    name="Facturas"
                    component={InvoicesScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
                    }}
                />
                <Tab.Screen
                    name="Placeholder"
                    component={View}
                />
                <Tab.Screen
                    name="Clientes"
                    component={ClientsScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
                    }}
                />
                <Tab.Screen
                    name="Inventario"
                    component={InventoryScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => <Box color={color} size={size} />,
                    }}
                />
            </Tab.Navigator>
            
            <View style={styles.fabCenterContainer}>
                <QuickActionMenu />
            </View>
        </View>
    );
}

export default function AppNavigator() {
    const { user, business, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!user ? (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="ConfirmationSuccess" component={ConfirmationSuccessScreen} />
                </>
            ) : !business ? (
                <Stack.Screen name="CreateBusiness" component={CreateBusinessScreen} />
            ) : (
                <>
                    <Stack.Screen name="MainTabs" component={TabNavigator} />
                    <Stack.Screen
                        name="NewInvoice"
                        component={NewInvoiceScreen}
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="InvoiceDetail"
                        component={InvoiceDetailScreen}
                    />
                    <Stack.Screen
                        name="ProductEdit"
                        component={ProductEditScreen}
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="ClientDashboard"
                        component={ClientDashboardScreen}
                    />
                    <Stack.Screen
                        name="ClientEdit"
                        component={ClientEditScreen}
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
                    />
                    <Stack.Screen
                        name="BusinessEdit"
                        component={BusinessEditScreen}
                        options={{ presentation: 'modal' }}
                    />
                    <Stack.Screen
                        name="UserEdit"
                        component={UserEditScreen}
                        options={{ presentation: 'modal' }}
                    />
                </>
            )}
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 25,
        left: TAB_BAR_MARGIN, 
        right: TAB_BAR_MARGIN,
        backgroundColor: 'rgba(15, 23, 42, 0.98)',
        borderRadius: 28,
        height: 68,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 15,
    },
    tabIndicator: {
        position: 'absolute',
        height: 68,
        top: 0,
        borderRadius: 28,
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        borderWidth: 1.2,
        borderColor: 'rgba(16, 185, 129, 0.4)',
        zIndex: 0,
    },
    indicatorInner: {
        flex: 1,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 28,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
        paddingHorizontal: 4, 
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 9.5, // Refinado para mayor visibilidad
        fontWeight: 'bold',
        marginTop: 2,
        letterSpacing: 0.2,
    },
    fabCenterContainer: {
        position: 'absolute', 
        bottom: 30, 
        left: 0, 
        right: 0, 
        alignItems: 'center', 
        zIndex: 100,
        pointerEvents: 'box-none'
    }
});
