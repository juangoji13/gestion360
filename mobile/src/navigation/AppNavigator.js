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

import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import QuickActionMenu from '../components/QuickActionMenu';

function TabNavigator() {
    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 25,
                        left: 20,
                        right: 20,
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderRadius: 30,
                        height: 65,
                        paddingBottom: 0,
                        borderTopWidth: 0,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                    },
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.textSecondary,
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        marginBottom: 8,
                    },
                    tabBarIconStyle: {
                        marginTop: 8,
                    }
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
                
                {/* Espacio para el botón central */}
                <Tab.Screen
                    name="Placeholder"
                    component={View}
                    options={{
                        tabBarButton: () => <View style={{ width: 60 }} />,
                    }}
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
            
            {/* Botón Flotante Central */}
            <View style={{ 
                position: 'absolute', 
                bottom: 30, 
                left: 0, 
                right: 0, 
                alignItems: 'center', 
                zIndex: 100,
                pointerEvents: 'box-none' // Permitir clicks en lo que hay debajo si no es el botón
            }}>
                <QuickActionMenu />
            </View>
        </View>
    );
}

export default function AppNavigator() {
    const { user, business, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
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
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
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
                </>
            )}
        </Stack.Navigator>
    );
}
