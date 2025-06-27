import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminOverviewStats from "@/components/admin/AdminOverviewStats";
import PendingReportsQueue from "@/components/admin/PendingReportsQueue";
import BulkActionTools from "@/components/admin/BulkActionTools";
import UserManagement from "@/components/admin/UserManagement";
import ContentModeration from "@/components/admin/ContentModeration";
import SystemSettings from "@/components/admin/SystemSettings";
import ReportGeneration from "@/components/admin/ReportGeneration";
import DatabaseExport from "@/components/admin/DatabaseExport";
import DatabaseSeeder from "@/components/admin/DatabaseSeeder";
import UserActivityLogs from "@/components/admin/UserActivityLogs";
import SystemHealthMonitoring from "@/components/admin/SystemHealthMonitoring";
import IntegrationStatus from "@/components/admin/IntegrationStatus";
import TelecomProviderDashboard from "@/components/admin/TelecomProviderDashboard";
import ThirdPartyIntegrations from "@/components/admin/ThirdPartyIntegrations";
import RealTimeSyncMonitor from "@/components/admin/RealTimeSyncMonitor";
import CaseEscalationSystem from "@/components/admin/CaseEscalationSystem";
import ComplianceMonitor from "@/components/admin/ComplianceMonitor";
import DatabaseStatus from "@/components/common/DatabaseStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administrative Dashboard
          </h1>
          <p className="text-gray-600">
            Manage fraud reports, users, and system integrations
          </p>
        </div>

        <div className="mb-8">
          <AdminOverviewStats />
        </div>

        <div className="mb-6">
          <DatabaseStatus showDetails={true} />
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-14">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="seeder">Seeder</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="telecom">Telecom</TabsTrigger>
            <TabsTrigger value="sync">Real-Time</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-6">
            <PendingReportsQueue />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ReportGeneration />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <DatabaseExport />
          </TabsContent>

          <TabsContent value="seeder" className="space-y-6">
            <DatabaseSeeder />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <UserActivityLogs />
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <SystemHealthMonitoring />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationStatus />
            <ThirdPartyIntegrations />
          </TabsContent>

          <TabsContent value="telecom" className="space-y-6">
            <TelecomProviderDashboard />
          </TabsContent>

          <TabsContent value="sync" className="space-y-6">
            <RealTimeSyncMonitor />
          </TabsContent>

          <TabsContent value="escalation" className="space-y-6">
            <CaseEscalationSystem />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceMonitor />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
