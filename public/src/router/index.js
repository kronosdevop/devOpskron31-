import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import store from "@/store";
import AuthHelper from "@/utils/authHelper.js";

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false },
  },

  {
    path: "/SignUp",
    name: "SignUp",
    component: () => import("../views/SignUp.vue"),
    meta: { requiresAuth: false },
  },

  {
    path: "/QR",
    name: "QRLogin",
    component: () => import("../views/QRLogin.vue"),
    meta: { requiresAuth: false },
  },

  {
    name: "ReportView",
    path: "/ReportView",
    component: () => import("@/components/DialogsList/ReportView.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/home",
    name: "Home",
    component: () => import("../views/HomeView.vue"),
    props: true,
    meta: { requiresAuth: true },
    children: [
      {
        name: "ChecklistUI",
        path: "ChecklistUI",
        component: () =>
          import("../components/CheckListComponent/ChecklistUI.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "CheckList",
        path: "CheckList",
        component: () =>
          import("../components/CheckListComponent/CheckListMain.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "WebSiteBuilder",
        path: "WebSiteBuilder",
        component: () =>
          import("../components/WebSiteBuilderApp/WebSiteBuilder.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "WebSiteTheme",
        path: "WebSiteTheme",
        component: () =>
          import("../components/WebSiteBuilderApp/WebSiteTheme.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "WebsiteDeploy",
        path: "WebsiteDeploy",
        component: () =>
          import("../components/WebSiteBuilderApp/WebsiteDeploy.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "WebsiteEdit",
        path: "WebsiteEdit",
        component: () =>
          import("../components/WebSiteBuilderApp/WebsiteEdit.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "WebsiteEditExisting",
        path: "WebsiteEditExisting",
        component: () =>
          import("../components/WebSiteBuilderApp/WebsiteEditExisting.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ChecklistCreation",
        path: "ChecklistCreation",
        component: () =>
          import(
            "../components/CheckListComponent/NewPopups/AddChecklistMain.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "ViewCheckList",
        path: "ViewCheckList",
        component: () =>
          import("../components/CheckListComponent/Popups/ChecklistView.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "EditChecklist",
        path: "EditChecklist",
        component: () =>
          import(
            "../components/CheckListComponent/NewPopups/EditChecklistMain.vue"
          ),
        meta: { requiresAuth: true },
      },

      {
        name: "TestUIfile",
        path: "TestUIfile",
        component: () => import("../views/TestUIfile.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "DashboardView",
        path: "DashboardView",
        component: () => import("../views/DashboardView.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "FileInput",
        path: "FileInput",
        component: () => import("../views/FileInput.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "AdminApps",
        path: "AdminLevelApps",
        component: () => import("../components/AdminLevelApps.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "MemberManagement",
        path: "Teams",
        component: () =>
          import("../components/SettingsComponents/MemberManagement.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "AdminTeam",
        path: "AdminTeam",
        component: () => import("../components/Teams/AdminTeam.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "UserTeams",
        path: "UserTeams",
        component: () => import("../components/Teams/UserTeams.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "AllTransactions",
        path: "AllTransactions",
        component: () =>
          import("../components/WorkflowReports/AllTransactions.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "TaskUserlevel",
        path: "TaskUserlevel",
        component: () =>
          import("../components/TaskDetailsApp/TaskUserlevel.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "DashboardChatview",
        path: "UserDashboard",
        component: () =>
          import("../components/AdminDashboard/DashboardChatview.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "FlowDesigner",
        path: "FlowDesigner",
        component: () => import("../components/FlowDesigner.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "UserCollaterals",
        path: "UserCollaterals",
        component: () =>
          import("../components/CollateralsApp/UserCollaterals.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "RootFolders",
        path: "RootFolders",
        component: () => import("../components/NewCabinet/RootFolders.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "SubmitedList",
        path: "Submitted",
        component: () => import("../components/Approvals/SubmitedList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "UserForms",
        path: "UserForms",
        component: () => import("../components/UserLevelForms/UserForms.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "UserChatgpt",
        path: "UserChatgpt",
        component: () =>
          import("../components/OrgGptComponents/UserChatgpt.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ApprovalForms",
        path: "ApprovalForms",
        component: () => import("../components/Approvals/ApprovalForms.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "ApprovalManagement",
        path: "ApprovalManagement",
        component: () =>
          import("../components/ExpensesManagement/ApprovalManagement.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "Announcement",
        path: "Broadcasts",
        component: () =>
          import("../components/Broadcast/BroadcastMessages.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "EventsUser",
        path: "EventsUser",
        component: () => import("../components/EventApp/UserEvents.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "UserlevelApp",
        path: "UserlevelApp",
        component: () => import("../components/UserlevelApp.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "UserLevel",
        path: "UserLevel",
        component: () => import("../components/PresenceApp/UserLevel"),
        meta: { requiresAuth: true },
      },
      {
        name: "UserExpense",
        path: "UserExpense",
        component: () => import("../components/ExpensesManagement/UserExpense"),
        meta: { requiresAuth: true },
      },
      {
        name: "AppadminExpenses",
        path: "AppadminExpenses",
        component: () =>
          import("../components/ExpensesManagement/AppadminExpenses"),
        meta: { requiresAuth: true },
      },
      {
        name: "Dashboarduser",
        path: "Dashboarduser",
        component: () =>
          import("../components/AdminDashboard/UserDashboard.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "AppAdmingpt",
        path: "AppAdmingpt",
        component: () =>
          import("../components/OrgGptComponents/AppAdmingpt.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "AppAdminprezence",
        path: "AppAdminprezence",
        component: () =>
          import("../components/PresenceApp/AppAdminprezence.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ChatComponents",
        path: "Chat",
        component: () => import("../components/ChatComponents.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ChannelList",
        path: "ChannelList",
        component: () => import("../components/Channels/ChannelList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ChannelsDetailsPage",
        path: "ChannelsDetailsPage",
        component: () =>
          import("../components/Channels/ChannelsDetailsPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "FormDesignerAdmin",
        path: "FormDesignerAdmin",
        component: () =>
          import("../components/FormDesigner/FormDesignerAdmin.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "AdminFlowDesigner",
        path: "AdminFlowDesigner",
        component: () =>
          import("../components/FormDesigner/AdminFlowDesigner.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "EditFlows",
        path: "EditFlows",
        component: () => import("../components/FormDesigner/EditFlows.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "AdminFormDesigner",
        path: "Forms",
        component: () =>
          import("../components/FormDesigner/AdminFormDesigner.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "CrmAdmins",
        path: "CrmAdmins",
        component: () => import("../components/CRM/CrmAdmins.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "ViewProduct",
        path: "ViewProduct",
        component: () => import("@/components/CRM/Popups/ViewProduct.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "CampainsDetails",
        path: "CampainsDetails",
        component: () => import("@/components/CRM/Popups/CampainsDetails.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "CRMFlowDesigner",
        path: "CRMFlowDesigner",
        component: () => import("../components/CRM/CRMFlowDesigner.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "TicketAdmins",
        path: "TicketManagement",
        component: () =>
          import("../components/TicketManagement/TicketAdmins.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "ProductTypes",
        path: "ProductTypes",
        component: () =>
          import("../components/TicketManagement/ProductTypes.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "DashBoardTypelist",
        path: "DashBoardTypelist",
        component: () =>
          import("../components/AdminDashboard/DashBoardType.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "DashboardList",
        path: "DashboardList",
        component: () =>
          import("../components/AdminDashboard/DashboardList.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "MessageTypes",
        path: "MessageTypes",
        component: () => import("../components/Broadcast/MessageTypes.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "BroadcastTypes",
        path: "BroadcastTypes",
        component: () => import("../components/Broadcast/BroadcastTypes.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "ChannelsList",
        path: "ChannelsList",
        component: () =>
          import("../components/SurveillanceApp/ChannelsList.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "EventPlanner",
        path: "EventPlanner",
        component: () => import("../components/EventApp/AdminEventPlanner.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "Usertickets",
        path: "Usertickets",
        component: () =>
          import(
            "@/components/TicketManagement/UserTicketMangement/UserTickets.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "MyPayslip",
        path: "MyPayslip",
        component: () => import("@/components/Payroll/MyPayslip.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "TicketTypes",
        path: "TicketTypes",
        component: () =>
          import(
            "@/components/TicketManagement/Ticketclaiming/TicketTypes.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "PayslipList",
        path: "PayslipList",
        component: () =>
          import("@/components/Payroll/AdminPayroll/PayslipList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ResourcesList",
        path: "ResourcesList",
        component: () => import("@/components/SloatBooking/ResourcesList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "AllResourceList",
        path: "UserResources",
        component: () =>
          import(
            "../components/SloatBooking/UserSlotsBooking/AllResourceList.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "BroadcastChatview",
        path: "BroadcastChatview",
        component: () => import("@/components/Broadcast/BroadcastChatview.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "PendingList",
        path: "PendingList",
        component: () => import("@/components/Approvals/PendingList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "SubmitedList",
        path: "SubmitedList",
        component: () => import("@/components/Approvals/SubmitedList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ParticipatedList",
        path: "ParticipatedList",
        component: () => import("@/components/Approvals/ParticipatedList.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "DirectoryDetails",
        path: "DirectoryDetails",
        component: () =>
          import("@/components/LookitUPDirectiory/DirectoryDetails.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "AdminFormTemplate",
        path: "AdminFormTemplate",
        component: () => import("../components/FormDesigner/AdminFormTemplate"),
        meta: { requiresAuth: true },
      },

      {
        name: "AdminChatgpt",
        path: "AdminChatgpt",
        component: () =>
          import("../components/OrgGptComponents/AdminChatgpt.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "UserCabinet",
        path: "Cabinet",
        component: () =>
          import("../components/CollateralsApp/CollateralsDocs.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "MyTask",
        path: "MyTask",
        component: () => import("../components/TaskDetailsApp/MyTask.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "AdminTimesheet",
        path: "AdminTimesheet",
        component: () => import("../components/TimeSheets/AdminTimesheet.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "UserLevelTimeSheet",
        path: "UserLevelTimeSheet",
        component: () =>
          import("../components/TimeSheets/UserLevelTimeSheet.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "UserTimesheetTypes",
        path: "UserTimesheetTypes",
        component: () =>
          import("../components/TimeSheets/UserTimesheetTypes.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "DirectoryList",
        path: "DirectoryList",
        component: () =>
          import("../components/LookitUPDirectiory/DirectoryList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "AdminTabs",
        path: "AdminTabs",
        component: () =>
          import("../components/VisitsManagementApp/AdminApp/AdminTabs.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "AdministrationPannel",
        path: "AdministrationPannel",
        component: () => import("../components/AdministrationPannel"),
        meta: { requiresAuth: true },
      },
      {
        name: "FarmList",
        path: "FarmList",
        component: () => import("../components/FarmApp/FarmList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "FarmMaps",
        path: "FarmMaps",
        component: () => import("../components/FarmMaps.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "FarmsUser",
        path: "FarmsUser",
        component: () => import("../components/FarmApp/FarmsUser.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "AdminFarmtypes",
        path: "AdminFarmtypes",
        component: () => import("@/components/FarmApp/AdminFarmtypes.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "BroadcastList",
        path: "BroadcastList",
        component: () => import("@/components/Broadcast/BroadcastList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "PayslipAdmintypes",
        path: "PayslipAdmintypes",
        component: () =>
          import("@/components/Payroll/AdminPayroll/PayslipAdmintypes.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "AssetTypes",
        path: "AssetTypes",
        component: () => import("@/components/Asset/AdminApps/AssetTypes.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "UserAsset",
        path: "UserAsset",
        component: () => import("@/components/Asset/UserAsset.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "SlotSubitems",
        path: "SlotSubitems",
        component: () => import("@/components/SloatBooking/SlotSubitems.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "SlotSubitems",
        path: "SlotSubitems",
        component: () => import("@/components/SloatBooking/SlotSubitems.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "DashboardSub",
        path: "Dashboard",
        component: () => import("@/components/DashBoard/DashboardSub.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "DashboardDetails",
        path: "DashboardDetails",
        component: () => import("@/components/DashBoard/DashboardDetails.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "GraphList",
        path: "GraphList",
        component: () => import("@/components/Graph/GraphList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "TvboardList",
        path: "TvboardList",
        component: () => import("@/components/TvApp/TvboardList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "TvboardSub",
        path: "TvboardSub",
        component: () => import("@/components/TvApp/TvboardSub.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "TvboardType",
        path: "TvboardType",
        component: () => import("@/components/TvApp/TvboardType.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "MaterialManagement",
        path: "MaterialManagement",
        component: () =>
          import("@/components/MaterialManagement/MaterialSub.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ProjectListing",
        path: "ProjectListing",
        component: () =>
          import("@/components/ProjectManagement/ProjectListing.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ProjectDetails",
        path: "ProjectDetails",
        component: () =>
          import("@/components/ProjectManagement/ProjectDetails.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "Purchase",
        path: "Purchase",
        component: () => import("@/components/Purchase/PurchaseList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "VehicalMasters",
        path: "VehicalMasters",
        component: () =>
          import("@/components/VehicleOptimizer/VehicalMasters.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "Chats",
        path: "Chats",
        component: () => import("@/components/ChatView.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "OrdersList",
        path: "OrdersList",
        component: () => import("@/components/Orders/OrderSub.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "GuestHouseList",
        path: "GuestHouseList",
        component: () =>
          import("@/components/GuestHouseBooking/GuestHouseList.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "BillingInfo",
        path: "BillingInfo",
        component: () => import("@/components/BillingInfo.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "Arap",
        path: "Arap",
        component: () => import("@/components/ARAP/ArapSub.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "BookingCalender",
        path: "BookingCalender",
        component: () =>
          import("@/components/GuestHouseBooking/BookingCalender.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "QuatotaionList",
        path: "/QuatotaionList",
        component: () =>
          import("@/components/QuotationBuilder/QuatotaionList.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "QuotationGeneration",
        path: "QuotationGeneration",
        component: () =>
          import("@/components/QuotationBuilder/QuotationGeneration.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ProformaGeneration",
        path: "ProformaGeneration",
        component: () =>
          import("@/components/QuotationBuilder/ProformaGeneration.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "QuotaionActions",
        path: "Quotations",
        component: () =>
          import("@/components/QuotationBuilder/QuotaionActions.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "BillingGeneration",
        path: "BillingGeneration",
        component: () =>
          import(
            "@/components/QuotationBuilder/PopupsDialogues/BillingGeneration.vue"
          ),
        meta: { requiresAuth: true },
      },

      {
        name: "GuestHouseBookingList",
        path: "GuestHouseBookingList",
        component: () =>
          import(
            "@/components/GuestHouseBooking/BookGuestHouse/GuestHouseBookingList.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "TestFile",
        path: "TestFile",
        component: () => import("@/components/QuotationBuilder/TestFile.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ChannelsMqqt",
        path: "channels",
        component: () => import("@/components/Channels/ChannelsMqqt.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "VendorManagement",
        path: "Vendors",
        component: () => import("@/components/VendorManagement/VendorSub.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "Inventory",
        path: "Inventory",
        component: () => import("@/components/Inventorys/InventorySub.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "StockAdd",
        path: "AddingStock",
        component: () => import("@/components/Inventory/Popups/StockAdd.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "CustomersList",
        path: "CustomersList",
        component: () =>
          import("@/components/CustomerManagement/CustomersList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "DefaultCustomerList",
        path: "DefaultCustomerList",
        component: () =>
          import("@/components/CustomerManagement/DefaultCustomerList.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "CreateCustomer",
        path: "CreateCustomer",
        component: () =>
          import("@/components/CustomerManagement/CreateCustomer.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "EditCustomer",
        path: "EditCustomer",
        component: () =>
          import("@/components/CustomerManagement/EditCustomer.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "ViewCustomer",
        path: "ViewCustomer",
        component: () =>
          import("@/components/CustomerManagement/ViewCustomer.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "UploadCustomer",
        path: "UploadCustomer",
        component: () =>
          import("@/components/CustomerManagement/UploadCustomer.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "UploadDistributors",
        path: "UploadDistributors",
        component: () => import("@/components/Asset/UploadDistributors.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "SupplierUpload",
        path: "SupplierUpload",
        component: () =>
          import("@/components/VendorManagement/SupplierUpload.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "BulkUploaddirectory",
        path: "BulkUploaddirectory",
        component: () =>
          import("@/components/LookitUPDirectiory/AllDialogs/BulkUpload.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "BulkUploadInventory",
        path: "BulkUploadInventory",
        component: () => import("@/components/Inventorys/ItemsBulkUpload.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "PresentReport",
        path: "PresentReport",
        component: () =>
          import(
            "@/components/PresenceApp/AdminLevelComponents/PresentReport.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "SwipeLogs",
        path: "SwipeLogs",
        component: () =>
          import("@/components/PresenceApp/AdminLevelComponents/SwipeLogs.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "AbsentReport",
        path: "AbsentReport",
        component: () =>
          import(
            "@/components/PresenceApp/AdminLevelComponents/AbsentReport.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "LeaveReport",
        path: "LeaveReport",
        component: () =>
          import(
            "@/components/PresenceApp/AdminLevelComponents/LeaveReport.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "DataCorrection",
        path: "DataCorrection",
        component: () =>
          import(
            "@/components/PresenceApp/AdminLevelComponents/DataCorrection.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "AllReport",
        path: "AllReport",
        component: () =>
          import(
            "@/components/PresenceApp/AdminLevelComponents/AllReportComp.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "Configuration",
        path: "Configuration",
        component: () =>
          import(
            "@/components/PresenceApp/AdminLevelComponents/ConfigurationTab.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "VisitLogs",
        path: "VisitLogs",
        component: () =>
          import("@/components/PresenceApp/AdminLevelComponents/VisitLogs.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "VisitorsList",
        path: "VisitorsList",
        component: () =>
          import(
            "@/components/PresenceApp/AdminLevelComponents/VisitorsList.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "UserTransaction",
        path: "UserTransaction",
        component: () =>
          import("@/components/ExpensesManagement/UserTransaction"),
        meta: { requiresAuth: true },
      },
      {
        name: "RewardsManagement",
        path: "RewardsManagement",
        component: () =>
          import("@/components/RewardsManagement/RewardsSub.vue"),
        meta: { requiresAuth: true },
      },

      {
        name: "SalesModule",
        path: "SalesModule",
        component: () => import("@/components/Sales/SalesModule.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "PurchaseSale",
        path: "PurchaseSale",
        component: () => import("@/components/PurchaseSale/PurchaseSub.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "CustommerSub",
        path: "CustommerSub",
        component: () =>
          import("@/components/CustomerManagement/CustommerSub.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "TicketsSub",
        path: "TicketsSub",
        component: () => import("@/components/Tickets/TicketsSub.vue"),
        meta: { requiresAuth: true },
      },
      {
        name: "VisitorSub",
        path: "VisitorSub",
        component: () =>
          import(
            "@/components/PresenceApp/AdminLevelComponents/VisitorSub.vue"
          ),
        meta: { requiresAuth: true },
      },
      {
        name: "Splay",
        path: "Splay",
        component: () => import("@/components/Splay/SplaySub.vue"),
        meta: { requiresAuth: true },
      },

      /*eslint-disable*/
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
