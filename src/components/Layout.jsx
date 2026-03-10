import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { getPageTitleByPath } from '../config/routes'
import './Layout.css'

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden'
            document.documentElement.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
    }, [mobileOpen])

    return (
        <div className="app-layout">
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Overlay for mobile when sidebar is open */}
            {mobileOpen && (
                <div
                    className="mobile-sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <main className="main-content">
                <div className="mobile-header">
                    <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <span className="mobile-header-title">{getPageTitleByPath(location.pathname)}</span>
                </div>

                <div className="main-content-inner">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
