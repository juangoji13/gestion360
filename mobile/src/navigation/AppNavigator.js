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

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.card,
                    borderTopWidth: 0,
                    height: 60,
                    paddingBottom: 10,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
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
