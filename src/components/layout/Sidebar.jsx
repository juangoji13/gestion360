import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import {
    LayoutDashboard, Users, Package, FileText, PlusCircle, Settings,
    Shield, LogOut, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import { getSidebarItems } from '../../config/routes'
import './Sidebar.css'


export default function Sidebar({ mobileOpen, setMobileOpen }) {
    const { user, business, isAdmin, signOut } = useAuth()
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                {!collapsed && (
                    <div className="sidebar-brand">
                        <div className="sidebar-logo">
                            {business?.logo_url ? (
                                <img src={business.logo_url} alt="Logo" />
                            ) : (
                                <span className="sidebar-logo-text">
                                    {(business?.name || 'E')[0].toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="sidebar-brand-info">
                            <span className="sidebar-brand-name">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}</span>
                            <span className="sidebar-brand-type">{business?.name || 'Mi Negocio'} {isAdmin && '(Admin)'}</span>
                        </div>
                    </div>
                )}
                <div className="sidebar-controls">
                    <button
                        className="sidebar-toggle desktop-only"
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? 'Expandir' : 'Colapsar'}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                    <button
                        className="sidebar-close-mobile mobile-only"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <nav className="sidebar-nav">
                {getSidebarItems(isAdmin).map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        title={collapsed && !mobileOpen ? item.label : undefined}
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        {(!collapsed || mobileOpen) && <span className="sidebar-link-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button
                    onClick={handleSignOut}
                    className="sidebar-link sidebar-logout"
                    title={collapsed && !mobileOpen ? 'Cerrar Sesión' : undefined}
                >
                    <span className="sidebar-link-icon"><LogOut size={20} /></span>
                    {(!collapsed || mobileOpen) && <span className="sidebar-link-label">Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    )
}
