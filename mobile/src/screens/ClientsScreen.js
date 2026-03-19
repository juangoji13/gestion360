import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { Search, Plus, MessageCircle, MapPin, AlertCircle, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import { useClients } from '../hooks/useClients';
import { useNavigation } from '@react-navigation/native';

const ClientCard = ({ client, onPress }) => {
    const { name, balance, lastSale, phone } = client;
    const handleWhatsApp = () => {
        if (phone) {
            Linking.openURL(`whatsapp://send?phone=${phone}&text=Hola ${name}, te saludo de Gestión360...`);
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.cardInfo}>
                <Text style={styles.name}>{name}</Text>
                <View style={styles.locationInfo}>
                    <MapPin color={COLORS.textSecondary} size={14} />
                    <Text style={styles.details}>{phone || 'Sin teléfono'}</Text>
                </View>
            </View>
            <View style={styles.cardRight}>
                <Text style={[styles.balance, { color: (balance || 0) <= 0 ? COLORS.success : COLORS.danger }]}>
                    ${(balance || 0).toLocaleString()}
                </Text>
                <Text style={styles.lastSale}>{lastSale ? `Ult: ${new Date(lastSale).toLocaleDateString()}` : 'Sin ventas'}</Text>
            </View>
            <TouchableOpacity style={styles.whatsappButton} onPress={handleWhatsApp}>
                <MessageCircle color={COLORS.primary} size={20} />
            </TouchableOpacity>
            <ChevronRight color={COLORS.textSecondary} size={16} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
    );
};

export default function ClientsScreen() {
    const navigation = useNavigation();
    const { clients, loading, error, refresh } = useClients();
    const [search, setSearch] = React.useState('');

    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.tax_id?.toLowerCase().includes(search.toLowerCase())
    );

    const totalPortfolio = clients.reduce((sum, c) => sum + (c.balance || 0), 0);

    const StatsWidget = () => (
        <View style={styles.statsCard}>
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Clientes</Text>
                <Text style={styles.statValue}>{clients.length}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
                <Text style={styles.statLabel}>Cartera Total</Text>
                <Text style={[styles.statValue, { color: COLORS.danger }]}>
                    ${(totalPortfolio || 0).toLocaleString()}
                </Text>
            </View>
        </View>
    );

    return (
        <LinearGradient colors={COLORS.darkGradient} style={styles.container}>
            {loading && clients.length > 0 && (
                <View style={styles.topLoader}>
                    <ActivityIndicator size="small" color={COLORS.success} />
                </View>
            )}
            <View style={styles.header}>
                <Text style={styles.title}>Clientes</Text>
            </View>

            <View style={styles.searchBar}>
                <Search color={COLORS.textSecondary} size={20} />
                <TextInput
                    style={styles.input}
                    placeholder="Buscar cliente..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {error && (
                <View style={styles.errorBanner}>
                    <AlertCircle color={COLORS.danger} size={16} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {loading && !clients.length ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredClients}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ClientCard
                            client={item}
                            onPress={() => navigation.navigate('ClientDashboard', { client: item })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={<StatsWidget />}
                    ListEmptyComponent={
                        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 }}>No se encontraron clientes</Text>
                    }
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.primary} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('ClientEdit', { mode: 'create' })}
            >
                <Plus color="white" size={28} />
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    topLoader: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 999,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        marginBottom: 15,
    },
    title: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        marginHorizontal: SIZES.padding,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        marginLeft: 10,
        fontSize: 14,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        padding: 20,
        borderRadius: SIZES.radius,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginBottom: 5,
    },
    statValue: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: COLORS.border,
    },
    errorBanner: {
        backgroundColor: COLORS.danger + '22',
        marginHorizontal: 20,
        padding: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    errorText: {
        color: COLORS.danger,
        marginLeft: 10,
        fontSize: 12,
    },
    list: {
        padding: 20,
        paddingBottom: 160,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardInfo: {
        flex: 1,
    },
    name: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    details: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginLeft: 4,
    },
    cardRight: {
        alignItems: 'flex-end',
        marginRight: 15,
    },
    balance: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    lastSale: {
        color: COLORS.textSecondary,
        fontSize: 11,
    },
    whatsappButton: {
        padding: 8,
        backgroundColor: COLORS.success + '11',
        borderRadius: 8,
    },
    fab: {
        position: 'absolute',
        right: 25,
        bottom: 110,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.success,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: COLORS.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
});
