import React from 'react';
import RootLayout from '../components/layout/RootLayout';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SummarySection from '../components/dashboard/SummarySection';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import TransactionList from '../components/dashboard/TransactionList';

function Dashboard() {
  return (
    <RootLayout>
      <DashboardHeader />
      <SummarySection />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <CashFlowChart />
        <TransactionList />
      </div>
    </RootLayout>
  );
}

export default Dashboard;
