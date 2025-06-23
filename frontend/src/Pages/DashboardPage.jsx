import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DashboardPage.css';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#aa46be', '#ff3d67'];

const DashboardPage = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [activityLog, setActivityLog] = useState([]);
  const [bestSellingProduct, setBestSellingProduct] = useState('');
  const [bestCustomer, setBestCustomer] = useState('');
  const [completedData, setCompletedData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [monthOptions, setMonthOptions] = useState([]);

  useEffect(() => {
    fetchAndGenerateFilters();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedFilter]);

  const fetchAndGenerateFilters = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/goods');
      const products = res.data;

      if (products.length === 0) return;

      const dates = products.map(p => new Date(p.createdAt));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));

      const options = generateMonthYearOptions(minDate, maxDate);
      setMonthOptions(['All', ...options]);
    } catch (error) {
      console.error('Error generating filter options:', error);
    }
  };

  const generateMonthYearOptions = (start, end) => {
    const options = [];
    const current = new Date(start);

    current.setDate(1);

    while (current <= end) {
      const option = format(current, 'yyyy-MM');
      options.push(option);
      current.setMonth(current.getMonth() + 1);
    }

    return options;
  };

  const fetchDashboardData = async () => {
    try {
      const [productsRes, ordersRes, historyRes] = await Promise.all([
        axios.get('http://localhost:3000/api/goods'),
        axios.get('http://localhost:3000/api/orders'),
        axios.get('http://localhost:3000/api/history'),
      ]);

      const products = productsRes.data;
      const orders = ordersRes.data;
      const filteredProducts = filterByDate(products);
      const filteredOrders = filterByDate(orders);

      setTotalProducts(filteredProducts.length);
      setActivityLog(historyRes.data);

      const completed = filteredOrders.filter(o => o.status === 'Completed');
      const pending = filteredOrders.filter(o => o.status === 'Pending');
      const revenue = completed.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      setTotalRevenue(revenue);
      setMonthlyRevenue(revenue / 12);
      setCompletedOrders(completed.length);
      setPendingOrders(pending.length);

      const bestProduct = getBestSellingProduct(filteredOrders);
      setBestSellingProduct(bestProduct);

      const bestCustomer = getBestCustomer(filteredOrders);
      setBestCustomer(bestCustomer);

      setCompletedData(generateChartData(completed));
      setPendingData(generateChartData(pending));
      setTotalData(generateChartData(filteredOrders));
    } catch (err) {
      console.error('Error loading dashboard data', err);
    }
  };

  const filterByDate = (data) => {
    if (selectedFilter === 'All') return data;
    return data.filter(d => d.createdAt && d.createdAt.startsWith(selectedFilter));
  };

  const getBestSellingProduct = (orders) => {
    const productSales = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.count;
      });
    });

    const best = Object.entries(productSales).reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0]);
    return best[0] || 'N/A';
  };

  const getBestCustomer = (orders) => {
    const customerOrders = {};
    orders.forEach(order => {
      customerOrders[order.customerName] = (customerOrders[order.customerName] || 0) + 1;
    });

    const best = Object.entries(customerOrders).reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0]);
    return best[0] || 'N/A';
  };

  const generateChartData = (orders) =>
    orders.map((order, i) => ({
      name: `Order #${order.id || i + 1}`,
      value: order.totalAmount || 0
    }));

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="date-filter">Select Month: </label>
        <select
          id="date-filter"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          {monthOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'All' ? 'All' : format(new Date(opt + '-01'), 'MMMM yyyy')}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card"><h3>Total Products</h3><p>{totalProducts}</p></div>
        <div className="stat-card"><h3>Total Revenue</h3><p>₹{totalRevenue.toFixed(2)}</p></div>
        <div className="stat-card"><h3>Completed Orders</h3><p>{completedOrders}</p></div>
        <div className="stat-card"><h3>Best Customer</h3><p>{bestCustomer}</p></div>
        <div className="stat-card"><h3>Best Selling Product</h3><p>{bestSellingProduct}</p></div>
        <div className="stat-card"><h3>Monthly Revenue</h3><p>₹{monthlyRevenue.toFixed(2)}</p></div>
        <div className="stat-card"><h3>Pending Orders</h3><p>{pendingOrders}</p></div>
      </div>

      <div className="charts-row">
        <div className="chart-box">
          <h3>Completed Orders</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={completedData}
                cx="50%" cy={130}
                startAngle={180} endAngle={0}
                innerRadius={50} outerRadius={80}
                dataKey="value" label
              >
                {completedData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Pending Orders</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pendingData}
                cx="50%" cy={130}
                startAngle={180} endAngle={0}
                innerRadius={50} outerRadius={80}
                dataKey="value" label
              >
                {pendingData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-box centered-chart">
        <h3>Total Revenue Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={totalData}
              cx="50%" cy="50%"
              outerRadius={100}
              dataKey="value" label
            >
              {totalData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <ul>
          {activityLog.slice(0, 4).map((log, index) => (
            <li key={log._id || index}>{log.detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;