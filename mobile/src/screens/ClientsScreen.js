import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Plus, MessageCircle, MapPin, AlertCircle, ChevronRight } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';
import { useClients } from '../hooks/useClients';
import { ActivityIndicator, RefreshControl, Linking } from 'react-native';
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
                <Text style={[styles.balance, { color: balance <= 0 ? COLORS.success : COLORS.danger }]}>
                    ${balance.toLocaleString()}
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
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Clientes</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <Search color={COLORS.text} size={24} />
                </TouchableOpacity>
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

            <View style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Clientes</Text>
                    <Text style={styles.statValue}>{clients.length}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Cartera Total</Text>
                    <Text style={[styles.statValue, { color: COLORS.danger }]}>
                        ${totalPortfolio.toLocaleString()}
                    </Text>
                </View>
            </View>

            {error && (
                <View style={{ backgroundColor: COLORS.danger + '22', marginHorizontal: 20, padding: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <AlertCircle color={COLORS.danger} size={16} />
                    <Text style={{ color: COLORS.danger, marginLeft: 10, fontSize: 12 }}>{error}</Text>
                </View>
            )}

            <ScrollView
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.primary} />
                }
            >
                {loading && !clients.length ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : filteredClients.length === 0 ? (
                    <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 40 }}>No se encontraron clientes</Text>
                ) : (
                    filteredClients.map(client => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onPress={() => navigation.navigate('ClientDashboard', { client })}
                        />
                    ))
                )}
            </ScrollView>

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('ClientEdit')}
            >
                <Plus color={COLORS.text} size={30} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 60,
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
        marginHorizontal: SIZES.padding,
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
    list: {
        paddingHorizontal: SIZES.padding,
        paddingBottom: 100,
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
        gap: 4,
    },
    details: {
        color: COLORS.textSecondary,
        fontSize: 12,
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
        backgroundColor: COLORS.primary + '11',
        borderRadius: 8,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
});
