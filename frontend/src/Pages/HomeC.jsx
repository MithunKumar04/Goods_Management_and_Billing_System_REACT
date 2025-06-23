import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddGoods from './AddGoods';
import ManageGoods from './ManageGoods';
import AddOrder from './AddOrder';
import HistoryPage from './HistoryPage';
import BillingPage from './BillingPage';
import DashboardPage from './DashboardPage';
import './Home.css';

import {
  FaCartPlus,
  FaTachometerAlt,
  FaBoxOpen,
  FaFileInvoiceDollar,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { MdAddShoppingCart, MdInventory2 } from 'react-icons/md';

const Settings = () => (
  <div className="content-container">
    <h2>Settings</h2>
    <div className="settings-section">
      <h3>Account Settings</h3>
      <form>
        <div className="form-group">
          <label>Email Notifications</label>
          <div className="toggle-switch">
            <input type="checkbox" id="email-toggle" defaultChecked />
            <label htmlFor="email-toggle"></label>
          </div>
        </div>
        <div className="form-group">
          <label>Two-Factor Authentication</label>
          <div className="toggle-switch">
            <input type="checkbox" id="2fa-toggle" />
            <label htmlFor="2fa-toggle"></label>
          </div>
        </div>
        <div className="form-group">
          <label>Theme</label>
          <select defaultValue="light">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System Default</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  </div>
);

function HomeEmp() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'addGoods':
        return <AddGoods />;
      case 'manageGoods':
        return <ManageGoods />;
      case 'addOrder':
        return <AddOrder />;
      case 'billing':
        return <BillingPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="home-container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {isSidebarOpen ? (
              <>
                <div className="kcm-logo">Karuparayan Cotton Mills</div>
                <div className="admin-title">Admin Portal</div>
              </>
            ) : (
              <div className="kcm-logo">KCM</div>
            )}
          </div>
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="user-info">
          <FaUserCircle className="user-avatar" />
          {isSidebarOpen && <span className="user-name">{name}</span>}
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <FaTachometerAlt />
              {isSidebarOpen && <span>Dashboard</span>}
            </li>
            <li className={activeTab === 'addGoods' ? 'active' : ''} onClick={() => setActiveTab('addGoods')}>
              <MdAddShoppingCart />
              {isSidebarOpen && <span>Add Goods</span>}
            </li>
            <li className={activeTab === 'manageGoods' ? 'active' : ''} onClick={() => setActiveTab('manageGoods')}>
              <MdInventory2 />
              {isSidebarOpen && <span>Manage Goods</span>}
            </li>
            <li className={activeTab === 'addOrder' ? 'active' : ''} onClick={() => setActiveTab('addOrder')}>
              <FaCartPlus />
              {isSidebarOpen && <span>Add Order</span>}
            </li>
            <li className={activeTab === 'billing' ? 'active' : ''} onClick={() => setActiveTab('billing')}>
              <FaFileInvoiceDollar />
              {isSidebarOpen && <span>Billing</span>}
            </li>
            <li className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
              <FaHistory />
              {isSidebarOpen && <span>History</span>}
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <FaCog />
              {isSidebarOpen && <span>Settings</span>}
            </li>
            <li onClick={handleLogout}>
              <FaSignOutAlt />
              {isSidebarOpen && <span>Logout</span>}
            </li>
          </ul>
        </nav>
      </div>

      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="content-header">
          <h1>Welcome, {name}!</h1>
          <p>{new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
        </div>
        <div className="content-body">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default HomeEmp;
