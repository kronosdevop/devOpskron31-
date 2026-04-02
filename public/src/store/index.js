import { createStore } from "vuex";

// Simple localStorage persistence plugin for Vue 3
const localStoragePlugin = (store) => {
  // Load state from localStorage on store initialization
  try {
    const savedState = localStorage.getItem("vuex-state");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Ensure websiteBuilder exists in the loaded state
      if (!parsedState.websiteBuilder) {
        parsedState.websiteBuilder = {
          prompt: "",
          selectedTheme: "",
          generatedData: null,
          themeObject: null,
        };
      }
      store.replaceState(parsedState);
    }
  } catch (error) {
    console.error("Error loading state from localStorage:", error);
    // Clear corrupted localStorage
    localStorage.removeItem("vuex-state");
  }

  // Save state to localStorage on every mutation
  store.subscribe((mutation, state) => {
    try {
      localStorage.setItem("vuex-state", JSON.stringify(state));
    } catch (error) {
      console.error("Error saving state to localStorage:", error);
    }
  });
};

/* eslint-disable no-new */
const store = createStore({
  plugins: [localStoragePlugin],
  state: {
    pAuth: false,
    pUserEmail: "",
    pCurrentUserObj: {},
    breadCrumbItems: [],
    firstSignUp: false,
    flowZeroStep: [],
    pOrgLogo: "",
    imageCheck: false,
    UserEmailTeam: "",
    OrgObject: {},
    formObject: {},
    appitems: {},
    flowItem: {},
    leaveTypes: [],
    productitems: {},
    checkPath: "",
    CRMForm: {},
    dashboarditems: {},
    Messageitems: {},
    appadmins: false,
    namesearch: "",
    formLibrary: false,
    formType: "",
    mqttClient: null,
    adminAppsCheck: false,
    administrationCheck: false,
    submittedTrue: false,
    fetchFormName: "",
    editFormDetails: {},
    formLibObject: {},
    auditActions: {},
    loginaudit: false,
    initiatorID: "",
    directorForm: false,
    reporttracker: {},
    libraryformtype: "",
    dashboardDetails: {},
    externalForm: false,
    PublishMessage: [],
    visitdetails: {},
    Tvdetails: {},
    customformDesigned: false,
    tvboardback: false,
    visitorFormEnabled: false,
    VisitorFormEdit: false,
    appName: "",
    appicon: "",
    notificationsData: [],
    tasks: [],
    pendingData: [],
    appList: [],
    openRestrictedChannels: [],
    chatMessageList: [],
    termsandconditions: {},
    // mqqtColor: "",
    stockStatus: "",
    dragCheck: false,
    customerDetails: {},
    customerData: {},
    reportiesData: {},
    distributorDetails: {},
    vendorbulkback: false,
    Checklist: {},
    attendenceBack: false,
    websiteBuilder: {
      prompt: "",
      selectedTheme: "",
      generatedData: null,
      themeObject: null,
      OPEN_CREATE_FORM :false,
        activeTab: "settings",
        worktype_form_id: null
    },
  },
  getters: {
    GetAuth: (state) => {
      return state.pAuth || false;
    },
      GetWorktypeFormId: (state) => state.worktype_form_id ,
      GetActiveTab: (state) => {
        return state.activeTab;},



    GetUserEmail: (state) => {
      return state.pUserEmail;
    },

    GetUserObj: (state) => {
      return state.pCurrentUserObj;
    },

    GetimageCheck: (state) => {
      return state.imageCheck;
    },

    GetBreadCrumbs: (state) => {
      return state.breadCrumbItems;
    },

    GetFirstSignup: (state) => {
      return state.firstSignUp;
    },

    GetOrgLogo: (state) => {
      return state.pOrgLogo;
    },

    GetflowZeroStep: (state) => {
      return state.flowZeroStep;
    },

    GetUserEmailTeam: (state) => {
      return state.UserEmailTeam;
    },
    GetOrgDetails: (state) => {
      return state.OrgObject || {};
    },

    GetFormObject: (state) => {
      return state.formObject;
    },

    Getappitems: (state) => {
      return state.appitems;
    },
    GetFlowItem: (state) => {
      return state.flowItem;
    },

    GetleaveTypes: (state) => {
      return state.leaveTypes;
    },
    Getproductitems: (state) => {
      return state.productitems;
    },
    GetPathInfo: (state) => {
      return state.checkPath;
    },
    GetCRMForm: (state) => {
      return state.CRMForm;
    },
    Getdashboarditems: (state) => {
      return state.dashboarditems;
    },
    GetMessageitems: (state) => {
      return state.Messageitems;
    },

    Getappadmins: (state) => {
      return state.appadmins;
    },

    Getnamesearch: (state) => {
      return state.namesearch;
    },

    GetFormLibrary: (state) => {
      return state.formLibrary;
    },

    GetFormType: (state) => {
      return state.formType;
    },
    GetMqttClient: (state) => {
      return state.mqttClient;
    },

    GetadministrationCheck: (state) => {
      return state.administrationCheck;
    },
    GetadminAppsCheck: (state) => {
      return state.adminAppsCheck;
    },

    GetFormName: (state) => {
      return state.fetchFormName;
    },
    GetEditFormDetails: (state) => {
      return state.editFormDetails;
    },
    GetFormLibObject: (state) => {
      return state.formLibObject;
    },
    GetAuditActions: (state) => {
      return state.auditActions;
    },
    Getloginaudit: (state) => {
      return state.loginaudit;
    },

    GetInitiatorId: (state) => {
      return state.initiatorID;
    },

    GetDirectoryForm: (state) => {
      return state.directorForm;
    },
    Getreporttracker: (state) => {
      return state.reporttracker;
    },
    Getlibraryformtype: (state) => {
      return state.libraryformtype;
    },
    GetdashboardDetails: (state) => {
      return state.dashboardDetails;
    },
    GetExternalForm: (state) => {
      return state.externalForm;
    },
    GetPublishMessage: (state) => {
      return state.PublishMessage;
    },
    GetTvdetails: (state) => {
      return state.Tvdetails;
    },
    GetCustomFormDesign: (state) => {
      return state.customformDesigned;
    },
    Gettvboardback: (state) => {
      return state.tvboardback;
    },
    GetVisitorFormEnabled: (state) => {
      return state.visitorFormEnabled;
    },
    GetappName: (state) => {
      return state.appName;
    },
    Getappicon: (state) => {
      return state.appicon;
    },
    Getvisitdetails: (state) => {
      return state.visitdetails;
    },

    GetVisitorFormEdit: (state) => {
      return state.VisitorFormEdit;
    },
    GetTermsandConditions: (state) => {
      return state.termsandconditions;
    },
    // GetmqqtColor: (state) => {
    //   return state.mqqtColor;
    // },
    GetdragCheck: (state) => {
      return state.dragCheck;
    },
    GetstockStatus: (state) => {
      return state.stockStatus;
    },
    GetDistributorDetails: (state) => {
      return state.distributorDetails;
    },
    GetcustomerDetails: (state) => {
      return state.customerDetails;
    },
    GetcustomerData: (state) => {
      return state.customerData;
    },
    Getvendorbulkback: (state) => {
      return state.vendorbulkback;
    },
    GetChecklist: (state) => {
      return state.Checklist;
    },
    GetattendenceBack: (state) => {
      return state.attendenceBack;
    },
    GetReporties: (state) => {
      return state.reportiesData;
    },
    getNotifications: (state) => state.notificationsData,
    getNotificationCount: (state) => state.notificationsData.length,
    getTaskData: (state) => state.tasks,
    getPendingInfo: (state) => state.pendingData,
    getAppList: (state) => state.appList,
    getOpenRestChanel: (state) => state.openRestrictedChannels,
    getChatMsg: (state) => state.chatMessageList,
    GetWebsiteBuilder: (state) => {
      return state.websiteBuilder;
    },
    GetWebsitePrompt: (state) => state.websiteBuilder.prompt,
    GetSelectedTheme: (state) => state.websiteBuilder.selectedTheme,
    GetGeneratedData: (state) => state.websiteBuilder.generatedData,
    GetThemeObject: (state) => state.websiteBuilder.themeObject,
  },
  mutations: {
    SetAuth(state, status) {
      state.pAuth = status;
    },
    OPEN_CREATE_FORM(state, val){
      state.openCreateForm = val
    },
  SET_ACTIVE_TAB(state, tab) {
    state.activeTab = tab;
  }
,
    // To set current user email
    SetUserEmail(state, useremail) {
      state.pUserEmail = useremail;
    },
    SetWorktypeFormId(state, id) {
    state.worktype_form_id = id;
  },
    SetOrgLogo(state, pOrgLogo) {
      state.pOrgLogo = pOrgLogo;
    },
    SetUserObj(state, userObj) {
      state.pCurrentUserObj = userObj;
    },
    SetBreadCrumbItems(state, listItems) {
      state.breadCrumbItems = listItems;
    },
    SetimageCheck(state, imageCheck) {
      state.imageCheck = imageCheck;
    },
    SetFirstSignup(state, signup) {
      state.firstSignUp = signup;
    },
    SetflowZeroStep(state, flow) {
      state.flowZeroStep = flow;
    },
    SetUserEmailTeam(state, UserEmailTeam) {
      state.UserEmailTeam = UserEmailTeam;
    },
    SetOrgDetails(state, orgInfo) {
      state.OrgObject = orgInfo;
    },
    SetFormObj(state, formInfo) {
      state.formObject = formInfo;
    },
    Setappitems(state, appitems) {
      state.appitems = appitems;
    },

    SetFlowItem(state, flowData) {
      state.flowItem = flowData;
    },

    SetLeaveType(state, leaves) {
      state.leaveTypes = leaves;
    },
    Setproductitems(state, productitems) {
      state.productitems = productitems;
    },
    Setpathinfo(state, pathinfo) {
      state.checkPath = pathinfo;
    },
    SetCRMForm(state, fromdata) {
      state.CRMForm = fromdata;
    },
    Setdashboarditems(state, dashboarditems) {
      state.dashboarditems = dashboarditems;
    },
    SetMessageitems(state, Messageitems) {
      state.Messageitems = Messageitems;
    },
    Setappadmins(state, appadmins) {
      state.appadmins = appadmins;
    },
    Setnamesearch(state, namesearch) {
      state.namesearch = namesearch;
    },
    SetformLibrary(state, formLib) {
      state.formLibrary = formLib;
    },

    SetFormType(state, formLib) {
      state.formType = formLib;
    },

    SetMqttClient(state, mqttCheck) {
      state.mqttClient = mqttCheck;
    },

    SetadministrationCheck(state, administrationCheck) {
      state.administrationCheck = administrationCheck;
    },

    SetadminAppsCheck(state, adminAppsCheck) {
      state.adminAppsCheck = adminAppsCheck;
    },

    SetFormName(state, formName) {
      state.fetchFormName = formName;
    },

    SetEditFormDetails(state, editForm) {
      state.editFormDetails = editForm;
    },

    SetFormLibObject(state, libObj) {
      state.formLibObject = libObj;
    },

    SetAuditActions(state, auditObj) {
      state.auditActions = auditObj;
    },
    Setloginaudit(state, loginaudit) {
      state.loginaudit = loginaudit;
    },

    SetInitiatorId(state, initiaotrID) {
      state.initiatorID = initiaotrID;
    },

    SetDirectoryForm(state, directoryForm) {
      state.directorForm = directoryForm;
    },
    Setreporttracker(state, reporttracker) {
      state.reporttracker = reporttracker;
    },
    Setlibraryformtype(state, libraryformtype) {
      state.libraryformtype = libraryformtype;
    },
    SetdashboardDetails(state, dashboardDetails) {
      state.dashboardDetails = dashboardDetails;
    },
    SetExternalForm(state, externalform) {
      state.externalForm = externalform;
    },
    SetPublishMessage(state, PublishMessage) {
      state.PublishMessage = PublishMessage;
    },
    SetTvdetails(state, Tvdetails) {
      state.Tvdetails = Tvdetails;
    },

    SetCustomFormDesign(state, customformDesigned) {
      state.customformDesigned = customformDesigned;
    },
    Settvboardback(state, tvboardback) {
      state.tvboardback = tvboardback;
    },

    SetVisitorFormEnabled(state, visitor) {
      state.visitorFormEnabled = visitor;
    },
    SetappName(state, visitor) {
      state.appName = visitor;
    },
    Setappicon(state, appicon) {
      state.appicon = appicon;
    },

    Setvisitdetails(state, visitdetails) {
      state.visitdetails = visitdetails;
    },
    SetVisitorFormEdit(state, VisitorFormEdit) {
      state.VisitorFormEdit = VisitorFormEdit;
    },

    SetTermsandConditions(state, termsandconditions) {
      state.termsandconditions = termsandconditions;
    },

    // SetmqqtColor(state, mqqtColor) {
    //   state.mqqtColor = mqqtColor;
    // },
    SetdragCheck(state, dragCheck) {
      state.dragCheck = dragCheck;
    },
    SetstockStatus(state, stockStatus) {
      state.stockStatus = stockStatus;
    },
    SetcustomerDetails(state, customerDetails) {
      state.customerDetails = customerDetails;
    },
    SetcustomerData(state, customerData) {
      state.customerData = customerData;
    },
    SetDistributorDetails(state, distributorDetails) {
      state.distributorDetails = distributorDetails;
    },
    Setvendorbulkback(state, vendorbulkback) {
      state.vendorbulkback = vendorbulkback;
    },
    SetChecklist(state, Checklist) {
      state.Checklist = Checklist;
    },
    SetWebsiteBuilder(state, websiteData) {
      state.websiteBuilder = { ...state.websiteBuilder, ...websiteData };
    },
    SetWebsitePrompt(state, prompt) {
      state.websiteBuilder.prompt = prompt;
    },
    SetSelectedTheme(state, theme) {
      state.websiteBuilder.selectedTheme = theme;
    },
    SetGeneratedData(state, data) {
      state.websiteBuilder.generatedData = data;
    },
    SetThemeObject(state, themeObj) {
      state.websiteBuilder.themeObject = themeObj;
    },
    SetattendenceBack(state, attendenceBack) {
      state.attendenceBack = attendenceBack;
    },
    SetReportieData(state, reportiesData) {
      state.reportiesData = reportiesData;
    },
    ClearWebsiteBuilder(state) {
      state.websiteBuilder = {
        prompt: "",
        selectedTheme: "",
        generatedData: null,
        themeObject: null,
      };
    },

    ADD_NOTIFICATION(state, notification) {
      if (
        !state.notificationsData.some(
          (item) => item.msgID === notification.msgID,
        )
      ) {
        state.notificationsData.push(notification);
        localStorage.setItem(
          "notoficationItems",
          JSON.stringify(state.notificationsData),
        ); // Update localStorage
      }
    },

    CLEAR_NOTIFICATIONS(state) {
      state.notificationsData = []; // Reset state
      localStorage.removeItem("notoficationItems"); // Clear localStorage
    },

    ADD_TASK(state, task) {
      state.tasks = [];
      state.tasks.push(task); // Store task in state
    },

    ADD_PENDING(state, pending) {
      state.pendingData = [];
      state.pendingData.push(pending);
    },

    CLEAR_TASKS(state) {
      state.tasks = []; // Clear tasks if needed
    },

    CLEAR_PENDING(state) {
      state.pendingData = []; // Clear tasks if needed
    },

    ADD_APP_LIST(state, applists) {
      state.appList = [];
      state.appList.push(applists);
    },

    CLEAR_APPLIST(state) {
      state.appList = [];
    },

    ADD_CHANNELS(state, openRestricted) {
      if (
        !state.openRestrictedChannels.some(
          (item) => item.msgId === openRestricted.msgId,
        )
      ) {
        state.openRestrictedChannels.push(openRestricted);
      }
    },
    CLEAR_CHANNELS(state) {
      state.openRestrictedChannels = [];
    },

    ADD_CHATS(state, chatmsges) {
      if (
        !state.chatMessageList.some((item) => item.msg_id === chatmsges.msg_id)
      ) {
        state.chatMessageList.push(chatmsges);
      }
    },

    CLEAR_CHATS(state) {
      state.chatMessageList = [];
    },

    // ADD_APP_LIST(state, applists) {
    //   state.appList = [];
    //   state.appList.push(applists);
    // },

    // openRestrictedChannels
  },
  actions: {
    removeAuth(context) {
      context.commit("SetUserEmail", "");
      context.commit("SetFirstSignup", false);
      context.commit("SET_AUTH", false);
    },
    receiveMessage({ commit }, message) {
      const jsonObject = message;

      if (jsonObject.message_type === "NOTIFICATION_MESSAGE") {
        const notification = {
          body: jsonObject,
          messageTitle: jsonObject.data.msg_title,
          initiatedBy: jsonObject.data.msg_description
            .split("\n")[0]
            .replace(" S", ""),
          msgID: jsonObject.data.msg_id,
          // currentUser: getters.GetUserObj.user.user_email_id
          // initited_on: jsonObject.data.msg_created_on,
          // initaited_by: jsonObject.data.msg_sent_by,
        };
        // console.log('notification', notification)

        commit("ADD_NOTIFICATION", notification);
      }

      if (jsonObject.message_type === "TASK") {
        const task = {
          body: jsonObject,
          taskDetails: jsonObject.data,
          // assignedBy: jsonObject.data.task_assign_by,
          // taskID: jsonObject.data.task_id,
          // dueDate: jsonObject.data.due_date,
        };
        // console.log("task", task);
        commit("ADD_TASK", task);
      }

      if (jsonObject.message_type === "PENDINGWORKFLOW") {
        const pending = {
          workflowName: jsonObject.data[0].workflow_name,
          workflow_initiated_by: jsonObject.data[0].workflow_initiated_by,
          workflowInitiatedOn: jsonObject.data[0].workflow_initiated_on,
          pendingcount: jsonObject.data[0].pending_workflows,
        };
        commit("CLEAR_PENDING");
        commit("ADD_PENDING", pending);
      }

      if (jsonObject.message_type == "BROADCAST_MESSAGE") {
        const openRestricted = {
          data: jsonObject.data,
          msgId: jsonObject.data.msg_id,
        };
        commit("ADD_CHANNELS", openRestricted);
      }
      if (
        jsonObject.message_type == "CHAT_MESSAGE" ||
        jsonObject.message_type == "ONE_ON_ONE_MESSAGE"
      ) {
        const chatmsges = {
          data: jsonObject.data,
          msg_id: jsonObject.data.msg_id,
        };

        commit("ADD_CHATS", chatmsges);
      }

      if (jsonObject.message_type === "APPSLIST") {
        const applists = {
          appusers: jsonObject.data,
        };
        commit("CLEAR_APPLIST");
        commit("ADD_APP_LIST", applists);
      }
    },

    logout({ commit }) {
      commit("CLEAR_NOTIFICATIONS");
      commit("CLEAR_TASKS");
      commit("CLEAR_PENDING");
      commit("CLEAR_APPLIST");
      commit("CLEAR_CHANNELS");
      commit("CLEAR_CHATS");
      commit("ClearWebsiteBuilder");
      // Clear notifications on logout
    },
  },
  modules: {},
});

export default store;
