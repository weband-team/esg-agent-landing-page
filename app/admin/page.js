'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';

// --- AUTH CREDENTIALS ---
const ADMIN_LOGIN = 'admin';
const ADMIN_PASS = 'GmzybwfGjh3';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #020617;
  color: #f1f5f9;
  font-family: var(--font-inter), 'Inter', sans-serif;
  padding-bottom: 5rem;
`;

const LoginOverlay = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #0f2d1e 0%, #020617 100%);
  padding: 1.5rem;
`;

const LoginCard = styled.div`
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(34, 197, 94, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;

  .logo {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    display: inline-block;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 0.9rem;
    color: #94a3b8;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #4ade80;
  }

  input {
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 0.9rem 1.1rem;
    color: #ffffff;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: #22c55e;
      background: rgba(30, 41, 59, 0.9);
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.25);
    }
  }
`;

const ErrorMsg = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #16a34a, #10b981);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);
  margin-top: 0.75rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.45);
  }

  &:active {
    transform: translateY(0);
  }
`;

// --- ADMIN DASHBOARD PANELS ---
const AdminHeader = styled.header`
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.25rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const HeaderLogo = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  color: #4ade80;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    color: #ffffff;
  }

  .badge {
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.3);
    color: #f59e0b;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  .user-info {
    font-size: 0.85rem;
    color: #94a3b8;
    strong {
      color: #ffffff;
    }
  }
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    border-color: #ef4444;
    color: #ffffff;
  }
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 2.5rem auto 0;
  padding: 0 2rem;
`;

// --- METRICS GRID ---
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const MetricCard = styled.div`
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #94a3b8;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 1.85rem;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.1;
  }

  .sub {
    font-size: 0.78rem;
    color: #4ade80;
    margin-top: 0.25rem;
  }

  .icon {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  &.primary {
    background: linear-gradient(135deg, rgba(22, 163, 74, 0.15) 0%, rgba(15, 23, 42, 0.45) 100%);
    border-color: rgba(34, 197, 94, 0.2);
    .icon {
      background: rgba(34, 197, 94, 0.1);
      color: #4ade80;
      border-color: rgba(34, 197, 94, 0.2);
    }
  }
`;

// --- CONTROLS BAR (SEARCH / FILTER / EXPORT) ---
const ControlsBar = styled.div`
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 280px;
  max-width: 440px;

  input {
    width: 100%;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    color: #ffffff;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: #22c55e;
      background: rgba(30, 41, 59, 0.8);
    }
  }

  .search-icon {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 0.95rem;
    pointer-events: none;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button`
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
    color: #ffffff;
  }

  &.active {
    background: rgba(34, 197, 94, 0.12);
    border-color: rgba(34, 197, 94, 0.35);
    color: #4ade80;
  }
`;

const ExportBtn = styled.button`
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(245, 158, 11, 0.1);
    border-color: #f59e0b;
    color: #ffffff;
  }
`;

// --- TABLE LAYOUT ---
const TableWrapper = styled.div`
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow-x: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
`;

const Th = styled.th`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
`;

const Tr = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.015);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Td = styled.td`
  padding: 1.25rem 1.5rem;
  vertical-align: middle;

  .primary-text {
    font-weight: 700;
    color: #ffffff;
  }

  .secondary-text {
    font-size: 0.8rem;
    color: #94a3b8;
    margin-top: 0.15rem;
  }

  .meta-pills {
    display: flex;
    gap: 0.35rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }

  .meta-pill {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.04);
    color: #cbd5e1;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;

  &::before {
    content: '●';
    font-size: 0.55rem;
  }

  &.pre-registered {
    background: rgba(14, 165, 233, 0.12);
    border: 1px solid rgba(14, 165, 233, 0.25);
    color: #38bdf8;
  }

  &.pending {
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.25);
    color: #f59e0b;
  }

  &.paid {
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.25);
    color: #4ade80;
  }

  &.refunded {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #f87171;
  }
`;

const StatusActionSelect = styled.select`
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 0.8rem;
  padding: 0.35rem 0.65rem;
  outline: none;
  cursor: pointer;
  transition: all 0.15s ease;

  &:focus {
    border-color: #22c55e;
  }

  option {
    background: #0f172a;
    color: #ffffff;
  }
`;

const TableEmpty = styled.div`
  padding: 5rem 2rem;
  text-align: center;
  color: #94a3b8;

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #475569;
  }

  h4 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.25rem;
  }

  p {
    font-size: 0.85rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rem 2rem;
  gap: 1rem;

  .spinner {
    width: 44px;
    height: 44px;
    border: 3px solid rgba(34, 197, 94, 0.1);
    border-top-color: #22c55e;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    font-size: 0.9rem;
    color: #94a3b8;
    font-weight: 600;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// --- MAIN REACT COMPONENT ---
export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Check cached credentials
  useEffect(() => {
    const cachedToken = localStorage.getItem('esg_admin_token');
    if (cachedToken === ADMIN_PASS) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch records if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
    }
  }, [isAuthenticated]);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/deposits', {
        headers: {
          'Authorization': `Bearer ${ADMIN_PASS}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setRecords(data.data || []);
      } else {
        console.error('Failed to load records:', data.error);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === ADMIN_LOGIN && password === ADMIN_PASS) {
      localStorage.setItem('esg_admin_token', ADMIN_PASS);
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('esg_admin_token');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // Update Status
  const handleStatusChange = async (reference, newStatus) => {
    try {
      const response = await fetch('/api/deposits', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_PASS}`
        },
        body: JSON.stringify({ reference, status: newStatus })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Optimistically update UI
        setRecords(prev =>
          prev.map(rec =>
            rec.reference === reference ? { ...rec, status: newStatus } : rec
          )
        );
      } else {
        alert('Error updating status: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Network error updating status.');
    }
  };

  // Filtered & Searched Records
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // 1. Status Filter
      const matchStatus = statusFilter === 'ALL' || rec.status.toUpperCase() === statusFilter;

      // 2. Search Box Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        rec.name.toLowerCase().includes(q) ||
        rec.email.toLowerCase().includes(q) ||
        rec.company.toLowerCase().includes(q) ||
        rec.phone.includes(q) ||
        rec.reference.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [records, statusFilter, searchQuery]);

  // Calculations for Metrics
  const stats = useMemo(() => {
    let csrdCount = 0;
    let griCount = 0;
    let otherCount = 0;
    let preRegisteredCount = 0;

    records.forEach(rec => {
      const statusUpper = rec.status.toUpperCase();
      if (statusUpper === 'PRE-REGISTERED') preRegisteredCount++;

      const std = (rec.standard || '').toUpperCase();
      if (std.includes('CSRD') || std.includes('VSME')) {
        csrdCount++;
      } else if (std.includes('GRI')) {
        griCount++;
      } else {
        otherCount++;
      }
    });

    return {
      total: records.length,
      preRegistered: preRegisteredCount,
      csrd: csrdCount,
      gri: griCount,
      other: otherCount
    };
  }, [records]);

  // Export to CSV
  const triggerCSVExport = () => {
    if (filteredRecords.length === 0) {
      alert('No records available to export.');
      return;
    }

    // CSV Headers
    const headers = [
      'ID',
      'Date Created',
      'Name',
      'Email',
      'Phone',
      'Company',
      'Industry',
      'Standard',
      'Reference Code',
      'Status'
    ];

    // CSV Rows
    const rows = filteredRecords.map(rec => [
      rec.id,
      rec.created_at,
      `"${rec.name.replace(/"/g, '""')}"`,
      rec.email,
      rec.phone,
      `"${rec.company.replace(/"/g, '""')}"`,
      rec.industry || 'Not Specified',
      rec.standard || 'CSRD VSME',
      rec.reference,
      rec.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Blob & Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `esg_registrations_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LOGIN PAGE STATE ---
  if (!isAuthenticated) {
    return (
      <LoginOverlay>
        <LoginCard>
          <LoginHeader>
            <div className="logo">🌿</div>
            <h1>ESG Agent Admin</h1>
            <p>Enter administrative credentials to proceed</p>
          </LoginHeader>
          <Form onSubmit={handleLoginSubmit}>
            <FormGroup>
              <label>Username</label>
              <input
                type="text"
                required
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <label>Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormGroup>
            {loginError && (
              <ErrorMsg>
                ⚠️ <span>{loginError}</span>
              </ErrorMsg>
            )}
            <LoginButton type="submit">Unlock Dashboard</LoginButton>
          </Form>
        </LoginCard>
      </LoginOverlay>
    );
  }

  // --- MAIN DASHBOARD BOARD STATE ---
  return (
    <PageContainer>
      <AdminHeader>
        <HeaderInner>
          <HeaderLogo>
            🌿 <span>ESG Compliance Agent</span>
            <div className="badge">Admin Panel</div>
          </HeaderLogo>
          <HeaderActions>
            <span className="user-info">
              Logged in as: <strong>{ADMIN_LOGIN}</strong>
            </span>
            <LogoutButton onClick={handleLogout}>Log Out</LogoutButton>
          </HeaderActions>
        </HeaderInner>
      </AdminHeader>

      <MainContent>
        {/* STATS SUMMARY CARD GRID */}
        <MetricsGrid>
          <MetricCard className="primary">
            <div className="info">
              <span className="label">Total Pre-Registrations</span>
              <span className="value">{stats.total}</span>
              <span className="sub">🚀 {stats.preRegistered} pre-registered (free)</span>
            </div>
            <div className="icon">👥</div>
          </MetricCard>
          <MetricCard>
            <div className="info">
              <span className="label">CSRD / VSME Interest</span>
              <span className="value">{stats.csrd}</span>
              <span className="sub">EU ESG requirements for SMEs</span>
            </div>
            <div className="icon">🇪🇺</div>
          </MetricCard>
          <MetricCard>
            <div className="info">
              <span className="label">GRI Standards Interest</span>
              <span className="value">{stats.gri}</span>
              <span className="sub">Global sustainability standards</span>
            </div>
            <div className="icon">📊</div>
          </MetricCard>
          <MetricCard>
            <div className="info">
              <span className="label">Other ESG Standards</span>
              <span className="value">{stats.other}</span>
              <span className="sub">ISO, EU Taxonomy, Undecided</span>
            </div>
            <div className="icon">🌿</div>
          </MetricCard>
        </MetricsGrid>

        {/* INTERACTIVE CONTROLS BAR */}
        <ControlsBar>
          <SearchBox>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, company, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>

          <FilterGroup>
            <FilterBtn
              className={statusFilter === 'ALL' ? 'active' : ''}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({records.length})
            </FilterBtn>
            <FilterBtn
              className={statusFilter === 'PRE-REGISTERED' ? 'active' : ''}
              onClick={() => setStatusFilter('PRE-REGISTERED')}
            >
              Pre-Registered ({records.filter(r => r.status.toUpperCase() === 'PRE-REGISTERED').length})
            </FilterBtn>
            <FilterBtn
              className={statusFilter === 'PENDING' ? 'active' : ''}
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending ({records.filter(r => r.status.toUpperCase() === 'PENDING').length})
            </FilterBtn>
            <FilterBtn
              className={statusFilter === 'PAID' ? 'active' : ''}
              onClick={() => setStatusFilter('PAID')}
            >
              Paid ({records.filter(r => r.status.toUpperCase() === 'PAID').length})
            </FilterBtn>
            <FilterBtn
              className={statusFilter === 'REFUNDED' ? 'active' : ''}
              onClick={() => setStatusFilter('REFUNDED')}
            >
              Refunded ({records.filter(r => r.status.toUpperCase() === 'REFUNDED').length})
            </FilterBtn>
          </FilterGroup>

          <ExportBtn onClick={triggerCSVExport}>
            📥 Export to CSV
          </ExportBtn>
        </ControlsBar>

        {/* DATA CONTAINER */}
        {isLoading ? (
          <LoadingContainer>
            <div className="spinner" />
            <p>Retrieving database records...</p>
          </LoadingContainer>
        ) : filteredRecords.length > 0 ? (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>Registration Date</Th>
                  <Th>User / Applicant</Th>
                  <Th>Company / Industry</Th>
                  <Th>Standard</Th>
                  <Th>Reference Code</Th>
                  <Th>Status</Th>
                  <Th style={{ textAlign: 'right' }}>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => {
                  const dateFormatted = new Date(rec.created_at).toLocaleString('pl-PL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <Tr key={rec.id}>
                      <Td>
                        <div className="primary-text">{dateFormatted}</div>
                        <div className="secondary-text">ID: #{rec.id}</div>
                      </Td>
                      <Td>
                        <div className="primary-text">{rec.name}</div>
                        <div className="secondary-text">{rec.email}</div>
                        <div className="secondary-text">{rec.phone}</div>
                      </Td>
                      <Td>
                        <div className="primary-text">{rec.company}</div>
                        <div className="secondary-text">{rec.industry || 'Not Specified'}</div>
                      </Td>
                      <Td>
                        <span className="status-badge pending" style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
                          {rec.standard || 'CSRD VSME'}
                        </span>
                      </Td>
                      <Td>
                        <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.8rem', color: '#ffffff', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {rec.reference}
                        </code>
                      </Td>
                      <Td>
                        <StatusBadge className={rec.status.toLowerCase().replace('_', '-')}>
                          {rec.status}
                        </StatusBadge>
                      </Td>
                      <Td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Set Status:</span>
                          <StatusActionSelect
                            value={rec.status.toUpperCase()}
                            onChange={(e) => handleStatusChange(rec.reference, e.target.value)}
                          >
                            <option value="PRE-REGISTERED">PRE-REGISTERED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="PAID">PAID</option>
                            <option value="REFUNDED">REFUNDED</option>
                          </StatusActionSelect>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrapper>
        ) : (
          <TableEmpty>
            <div className="icon">📁</div>
            <h4>No registration records found</h4>
            <p>
              {records.length === 0
                ? 'No user registrations have been recorded in the database yet.'
                : 'No records match your active filter or search queries.'}
            </p>
          </TableEmpty>
        )}
      </MainContent>
    </PageContainer>
  );
}
