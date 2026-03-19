import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, Plus, DollarSign, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import { useInvoices } from '../hooks/useInvoices';
import { useNavigation } from '@react-navigation/native';

const InvoiceCard = ({ invoice, onPress }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return COLORS.success;
            case 'pending': return COLORS.warning;
            default: return COLORS.textSecondary;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'paid': return 'Pagada';
            case 'pending': return 'Pendiente';
            default: return status;
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.cardHeader}>
                <Text style={styles.invoiceId}>{invoice.invoice_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '22' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>{getStatusText(invoice.status)}</Text>
                </View>
            </View>
            <Text style={styles.clientName}>{invoice.client?.name || 'Cliente Genérico'}</Text>
            <View style={styles.cardFooter}>
                <Text style={styles.date}>{new Date(invoice.created_at).toLocaleDateString()}</Text>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.amount}>${(invoice.total || 0).toLocaleString()}</Text>
                    {invoice.amount_paid > 0 && invoice.status !== 'paid' && (
                        <Text style={{ color: COLORS.warning, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                            Resta: ${(invoice.total - invoice.amount_paid).toLocaleString()}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function InvoicesScreen() {
    const navigation = useNavigation();
    const { invoices, loading, error, totalPending, refresh } = useInvoices();
    const [search, setSearch] = React.useState('');
    const [filter, setFilter] = React.useState('Todas');

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
            inv.client?.name?.toLowerCase().includes(search.toLowerCase());

        if (filter === 'Todas') return matchesSearch;
        if (filter === 'Pendientes') return matchesSearch && inv.status === 'pending';
        if (filter === 'Pagadas') return matchesSearch && inv.status === 'paid';
        return matchesSearch;
    });

    return (
        <LinearGradient colors={COLORS.darkGradient} style={styles.container}>
            {loading && invoices.length > 0 && (
                <View style={styles.topLoader}>
                    <ActivityIndicator size="small" color={COLORS.success} />
                </View>
            )}
            <View style={styles.header}>
                <Text style={styles.title}>Facturas</Text>
            </View>

            <View style={styles.searchBar}>
                <Search color={COLORS.textSecondary} size={20} />
                <TextInput
                    style={styles.input}
                    placeholder="Buscar factura o cliente..."
                    placeholderTextColor={COLORS.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={styles.filterBar}>
                {['Todas', 'Pendientes', 'Pagadas'].map((label) => (
                    <TouchableOpacity
                        key={label}
                        style={[styles.chip, filter === label && styles.activeChip]}
                        onPress={() => setFilter(label)}
                    >
                        <Text style={[styles.chipText, filter === label && styles.activeChipText]}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                    <DollarSign color={COLORS.secondary} size={20} />
                </View>
                <View>
                    <Text style={styles.summaryLabel}>Pendiente por cobrar</Text>
                    <Text style={styles.summaryValue}>${(totalPending || 0).toLocaleString()}</Text>
                </View>
            </View>

            {error && (
                <View style={styles.errorBanner}>
                    <AlertCircle color={COLORS.danger} size={16} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {loading && !invoices.length ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredInvoices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <InvoiceCard
                            invoice={item}
                            onPress={() => navigation.navigate('InvoiceDetail', { invoice: item })}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No se encontraron facturas</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('NewInvoice')}
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
        marginBottom: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        marginLeft: 10,
        fontSize: 14,
    },
    filterBar: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.padding,
        marginBottom: 20,
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: COLORS.card,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    activeChip: {
        backgroundColor: COLORS.success + '22',
        borderColor: COLORS.success,
    },
    chipText: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    activeChipText: {
        color: COLORS.success,
        fontWeight: 'bold',
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        marginHorizontal: SIZES.padding,
        padding: 20,
        borderRadius: 28,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(16, 185, 129, 0.15)',
    },
    summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.secondary + '22',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    summaryLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    summaryValue: {
        color: COLORS.success,
        fontSize: 20,
        fontWeight: '800',
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
        backgroundColor: COLORS.card,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    invoiceId: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    statusBadge: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    clientName: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 10,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    amount: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold',
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
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 16,
    },
});
