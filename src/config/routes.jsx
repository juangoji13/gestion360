import { lazy } from 'react'
import {
    LayoutDashboard, Users, Package, FileText,
    PlusCircle, Settings, Shield
} from 'lucide-react'

// Lazy loaded components
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Clients = lazy(() => import('../pages/Clients'))
const Products = lazy(() => import('../pages/Products'))
const Invoices = lazy(() => import('../pages/Invoices'))
const CreateInvoice = lazy(() => import('../pages/CreateInvoice'))
const InvoiceView = lazy(() => import('../pages/InvoiceView'))
const SettingsPage = lazy(() => import('../pages/Settings'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'))

export const ROUTES = {
    DASHBOARD: {
        path: '/',
        element: <Dashboard />,
        label: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
        showInSidebar: true
    },
    CLIENTS: {
        path: '/clients',
        element: <Clients />,
        label: 'Clientes',
        icon: <Users size={20} />,
        showInSidebar: true
    },
    PRODUCTS: {
        path: '/products',
        element: <Products />,
        label: 'Productos',
        icon: <Package size={20} />,
        showInSidebar: true
    },
    INVOICES: {
        path: '/invoices',
        element: <Invoices />,
        label: 'Facturas',
        icon: <FileText size={20} />,
        showInSidebar: true
    },
    CREATE_INVOICE: {
        path: '/invoices/new',
        element: <CreateInvoice />,
        label: 'Nueva Factura',
        icon: <PlusCircle size={20} />,
        showInSidebar: true
    },
    EDIT_INVOICE: {
        path: '/invoices/edit/:id',
        element: <CreateInvoice />,
        label: 'Editar Factura',
        showInSidebar: false
    },
    INVOICE_VIEW: {
        path: '/invoices/:id',
        element: <InvoiceView />,
        label: 'Detalle Factura',
        showInSidebar: false
    },
    SETTINGS: {
        path: '/settings',
        element: <SettingsPage />,
        label: 'Configuración',
        icon: <Settings size={20} />,
        showInSidebar: true
    },
    ADMIN: {
        path: '/admin',
        element: <AdminDashboard />,
        label: 'Panel Admin',
        icon: <Shield size={20} />,
        showInSidebar: true,
        isAdmin: true
    },
    PRIVACY: {
        path: '/privacy',
        element: <PrivacyPolicy />,
        label: 'Privacidad',
        showInSidebar: false
    }
}

export const getSidebarItems = (isAdmin) => {
    return Object.values(ROUTES).filter(route =>
        route.showInSidebar && (!route.isAdmin || isAdmin)
    )
}

export const getPageTitleByPath = (pathname) => {
    // Buscar coincidencia exacta o por patrón (ej: /invoices/:id)
    const route = Object.values(ROUTES).find(r => {
        if (r.path === pathname) return true
        if (r.path.includes(':')) {
            const baseRoute = r.path.split('/:')[0]
            return pathname.startsWith(baseRoute) && pathname !== baseRoute
        }
        return false
    })
    return route?.label || 'Facturación'
}
