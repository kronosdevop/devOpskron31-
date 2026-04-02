/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const edit_organization = /* GraphQL */ `
  mutation Edit_organization($input: EditOrganizationInput) {
    edit_organization(input: $input)
  }
`;
export const create_teams = /* GraphQL */ `
  mutation Create_teams($input: CreateTeamsInput) {
    create_teams(input: $input)
  }
`;
export const edit_team_details = /* GraphQL */ `
  mutation Edit_team_details($input: EditTeamDetailsInput) {
    edit_team_details(input: $input)
  }
`;
export const create_locations = /* GraphQL */ `
  mutation Create_locations($input: CreateLocationsInput) {
    create_locations(input: $input)
  }
`;
export const create_departments = /* GraphQL */ `
  mutation Create_departments($input: CreateDepartmentsInput) {
    create_departments(input: $input)
  }
`;
export const create_designation = /* GraphQL */ `
  mutation Create_designation($input: CreateDesignationInput) {
    create_designation(input: $input)
  }
`;
export const activate_and_reactivate_locations = /* GraphQL */ `
  mutation Activate_and_reactivate_locations(
    $location_id: String
    $location_status: enumuserstatus
  ) {
    activate_and_reactivate_locations(
      location_id: $location_id
      location_status: $location_status
    )
  }
`;
export const activate_and_reactivate_departments = /* GraphQL */ `
  mutation Activate_and_reactivate_departments(
    $department_id: String
    $department_status: enumuserstatus
  ) {
    activate_and_reactivate_departments(
      department_id: $department_id
      department_status: $department_status
    )
  }
`;
export const activate_and_reactivate_expense_group = /* GraphQL */ `
  mutation Activate_and_reactivate_expense_group(
    $expense_group_id: String
    $expense_group_status: enumuserstatus
  ) {
    activate_and_reactivate_expense_group(
      expense_group_id: $expense_group_id
      expense_group_status: $expense_group_status
    )
  }
`;
export const activate_and_reactivate_designations = /* GraphQL */ `
  mutation Activate_and_reactivate_designations(
    $designation_id: String
    $designation_status: enumuserstatus
  ) {
    activate_and_reactivate_designations(
      designation_id: $designation_id
      designation_status: $designation_status
    )
  }
`;
export const create_worklow = /* GraphQL */ `
  mutation Create_worklow($input: CreateWorkFlowInput) {
    create_worklow(input: $input)
  }
`;
export const change_of_owner_ship = /* GraphQL */ `
  mutation Change_of_owner_ship($input: ChangeOfOwnerShipInput) {
    change_of_owner_ship(input: $input)
  }
`;
export const add_or_remove_admin = /* GraphQL */ `
  mutation Add_or_remove_admin($user_id: String!, $user_type: enumusertype) {
    add_or_remove_admin(user_id: $user_id, user_type: $user_type)
  }
`;
export const edit_user = /* GraphQL */ `
  mutation Edit_user($input: EditUserInput) {
    edit_user(input: $input)
  }
`;
export const edit_location = /* GraphQL */ `
  mutation Edit_location(
    $location_id: String!
    $geo_lat: String!
    $geo_long: String!
    $location_pincode: Int!
    $location_state: String!
    $location_country: String!
    $location_district: String!
    $location_address: String!
    $location_type: String!
    $distributor_id: String!
    $retailer_id: String!
    $territory_id: String!
  ) {
    edit_location(
      location_id: $location_id
      geo_lat: $geo_lat
      geo_long: $geo_long
      location_pincode: $location_pincode
      location_state: $location_state
      location_country: $location_country
      location_district: $location_district
      location_address: $location_address
      location_type: $location_type
      distributor_id: $distributor_id
      retailer_id: $retailer_id
      territory_id: $territory_id
    )
  }
`;
export const delete_user = /* GraphQL */ `
  mutation Delete_user($user_id: String, $user_status: enumuserstatus) {
    delete_user(user_id: $user_id, user_status: $user_status)
  }
`;
export const team_api_key_generation = /* GraphQL */ `
  mutation Team_api_key_generation($input: TeamApiKeyGenerationInput) {
    team_api_key_generation(input: $input)
  }
`;
export const add_or_delete_hloiday = /* GraphQL */ `
  mutation Add_or_delete_hloiday($input: AddOrDeleteHloidayInput) {
    add_or_delete_hloiday(input: $input)
  }
`;
export const create_workflow_roles = /* GraphQL */ `
  mutation Create_workflow_roles($input: CreateWorflowRolesInput) {
    create_workflow_roles(input: $input)
  }
`;
export const delete_workflow_roles = /* GraphQL */ `
  mutation Delete_workflow_roles(
    $workflow_role_id: String!
    $workflow_role_status: enumuserstatus
  ) {
    delete_workflow_roles(
      workflow_role_id: $workflow_role_id
      workflow_role_status: $workflow_role_status
    )
  }
`;
export const workflow_initiates = /* GraphQL */ `
  mutation Workflow_initiates($input: WorkflowInitiatesInput) {
    workflow_initiates(input: $input)
  }
`;
export const forms_deploy_for_organization = /* GraphQL */ `
  mutation Forms_deploy_for_organization(
    $input: FormsDeployForOrganizationInput
  ) {
    forms_deploy_for_organization(input: $input)
  }
`;
export const change_location_head = /* GraphQL */ `
  mutation Change_location_head($location_id: String!, $location_head: String) {
    change_location_head(
      location_id: $location_id
      location_head: $location_head
    )
  }
`;
export const update_dashoard_details = /* GraphQL */ `
  mutation Update_dashoard_details(
    $dashboard_id: String!
    $is_display: Boolean
    $sort_range: Int
  ) {
    update_dashoard_details(
      dashboard_id: $dashboard_id
      is_display: $is_display
      sort_range: $sort_range
    )
  }
`;
export const create_task_and_assign = /* GraphQL */ `
  mutation Create_task_and_assign($input: CreateTaskAndAssignInput) {
    create_task_and_assign(input: $input)
  }
`;
export const gpt_ai_settings = /* GraphQL */ `
  mutation Gpt_ai_settings($input: GptAiSettingsInput) {
    gpt_ai_settings(input: $input)
  }
`;
export const workflow_appr_rej = /* GraphQL */ `
  mutation Workflow_appr_rej($input: WorkflowAppRejInpiut) {
    workflow_appr_rej(input: $input)
  }
`;
export const createDashboard = /* GraphQL */ `
  mutation CreateDashboard($input: CreateDashboardInput) {
    createDashboard(input: $input)
  }
`;
export const edit_or_delete_dashboard_topic = /* GraphQL */ `
  mutation Edit_or_delete_dashboard_topic(
    $input: EditOrDeleteDashboardTopicInput
  ) {
    edit_or_delete_dashboard_topic(input: $input)
  }
`;
export const openai_api_key_verification = /* GraphQL */ `
  mutation Openai_api_key_verification($input: OpenaiApiKeyVerificationInput) {
    openai_api_key_verification(input: $input)
  }
`;
export const create_events = /* GraphQL */ `
  mutation Create_events($input: CreateEventsInput) {
    create_events(input: $input)
  }
`;
export const edit_delete_events = /* GraphQL */ `
  mutation Edit_delete_events($input: EditDeleteEventsInput) {
    edit_delete_events(input: $input)
  }
`;
export const publish_broadcast_messages = /* GraphQL */ `
  mutation Publish_broadcast_messages($input: PublishBroadcastMessagesInput) {
    publish_broadcast_messages(input: $input)
  }
`;
export const enable_forms = /* GraphQL */ `
  mutation Enable_forms($input: EnableFormsInput) {
    enable_forms(input: $input)
  }
`;
export const un_or_register_members_for_event = /* GraphQL */ `
  mutation Un_or_register_members_for_event(
    $input: UnOrRegisterMembersForEventInput
  ) {
    un_or_register_members_for_event(input: $input)
  }
`;
export const task_completion = /* GraphQL */ `
  mutation Task_completion($input: TaskCompletionInput) {
    task_completion(input: $input)
  }
`;
export const create_broadcast = /* GraphQL */ `
  mutation Create_broadcast($input: CreateBroadcastInput) {
    create_broadcast(input: $input)
  }
`;
export const delete_broadcast_channel = /* GraphQL */ `
  mutation Delete_broadcast_channel($input: DeleteBroadcastChannelInput) {
    delete_broadcast_channel(input: $input)
  }
`;
export const edit_broadcast_channel = /* GraphQL */ `
  mutation Edit_broadcast_channel($input: EditBroadcastChannelInput) {
    edit_broadcast_channel(input: $input)
  }
`;
export const create_membership = /* GraphQL */ `
  mutation Create_membership($input: CreateMembershipInput) {
    create_membership(input: $input)
  }
`;
export const delete_membership = /* GraphQL */ `
  mutation Delete_membership($input: DeleteMembershipInput) {
    delete_membership(input: $input)
  }
`;
export const create_expense_category = /* GraphQL */ `
  mutation Create_expense_category($input: CreateExpenseCategoryInput) {
    create_expense_category(input: $input)
  }
`;
export const initiate_expense = /* GraphQL */ `
  mutation Initiate_expense($input: InitiateExpenseInput) {
    initiate_expense(input: $input)
  }
`;
export const update_expense_forms = /* GraphQL */ `
  mutation Update_expense_forms($input: UpdateExpenseFormInput) {
    update_expense_forms(input: $input)
  }
`;
export const delete_expense = /* GraphQL */ `
  mutation Delete_expense($input: DeleteExpenseInput) {
    delete_expense(input: $input)
  }
`;
export const custom_form_creation = /* GraphQL */ `
  mutation Custom_form_creation($input: CustomFormCreationInput) {
    custom_form_creation(input: $input)
  }
`;
export const custom_form_design = /* GraphQL */ `
  mutation Custom_form_design($input: CustomFormDesignInput) {
    custom_form_design(input: $input)
  }
`;
export const early_salary_settings = /* GraphQL */ `
  mutation Early_salary_settings($input: EarlySalarySettingsInput) {
    early_salary_settings(input: $input)
  }
`;
export const dashboard_view_edit = /* GraphQL */ `
  mutation Dashboard_view_edit(
    $user_id: String
    $dashboard_view: enumdashboardview
  ) {
    dashboard_view_edit(user_id: $user_id, dashboard_view: $dashboard_view)
  }
`;
export const data_correction_swipes_from_admins = /* GraphQL */ `
  mutation Data_correction_swipes_from_admins(
    $input: DataCorrectionSwipesFromAdminsInput
  ) {
    data_correction_swipes_from_admins(input: $input)
  }
`;
export const publish_and_unpublish_flows = /* GraphQL */ `
  mutation Publish_and_unpublish_flows($input: PublishAndUnpublishFlowsInput) {
    publish_and_unpublish_flows(input: $input)
  }
`;
export const edit_form_details = /* GraphQL */ `
  mutation Edit_form_details($input: EditFormDetailsInput) {
    edit_form_details(input: $input)
  }
`;
export const request_early_salary = /* GraphQL */ `
  mutation Request_early_salary($input: ReuqestEarlySalaryInput) {
    request_early_salary(input: $input)
  }
`;
export const earlysalary_reports_generartion = /* GraphQL */ `
  mutation Earlysalary_reports_generartion(
    $input: EarlysalaryReportsGenerartionInput
  ) {
    earlysalary_reports_generartion(input: $input)
  }
`;
export const master_leave_settings = /* GraphQL */ `
  mutation Master_leave_settings($input: MasterLeaveSettingsInput) {
    master_leave_settings(input: $input)
  }
`;
export const edit_get_leave_approvals = /* GraphQL */ `
  mutation Edit_get_leave_approvals($input: EditGetLeaveApprovalsInput) {
    edit_get_leave_approvals(input: $input)
  }
`;
export const request_apply_leave = /* GraphQL */ `
  mutation Request_apply_leave($input: RequestApplyLeaveInput) {
    request_apply_leave(input: $input)
  }
`;
export const presence_reports = /* GraphQL */ `
  mutation Presence_reports($input: PresenceReportsInput) {
    presence_reports(input: $input)
  }
`;
export const create_product = /* GraphQL */ `
  mutation Create_product($input: CreateProductInput) {
    create_product(input: $input)
  }
`;
export const edit_product = /* GraphQL */ `
  mutation Edit_product($input: EditProductInput) {
    edit_product(input: $input)
  }
`;
export const create_categories_for_product = /* GraphQL */ `
  mutation Create_categories_for_product(
    $input: CreateCategoriesForProductInput
  ) {
    create_categories_for_product(input: $input)
  }
`;
export const edit_delete_categories_for_product = /* GraphQL */ `
  mutation Edit_delete_categories_for_product(
    $input: EditDeleteCategoriesForProductInput
  ) {
    edit_delete_categories_for_product(input: $input)
  }
`;
export const add_product_admins = /* GraphQL */ `
  mutation Add_product_admins($input: AddProductAdminsInput) {
    add_product_admins(input: $input)
  }
`;
export const remove_product_admins = /* GraphQL */ `
  mutation Remove_product_admins($input: RemoveProductAdminsInput) {
    remove_product_admins(input: $input)
  }
`;
export const create_customer_for_product = /* GraphQL */ `
  mutation Create_customer_for_product($input: CreateCustomerForProductInput) {
    create_customer_for_product(input: $input)
  }
`;
export const customer_bulk_upload = /* GraphQL */ `
  mutation Customer_bulk_upload($input: CustomerBulkUploadInput) {
    customer_bulk_upload(input: $input)
  }
`;
export const form_deactivate = /* GraphQL */ `
  mutation Form_deactivate($input: FormDeactivateinput) {
    form_deactivate(input: $input)
  }
`;
export const ticket_rasie_from_internal = /* GraphQL */ `
  mutation Ticket_rasie_from_internal($input: TicketRasieFromInternalInput) {
    ticket_rasie_from_internal(input: $input)
  }
`;
export const assign_tickets = /* GraphQL */ `
  mutation Assign_tickets($input: AssignTicketsInput) {
    assign_tickets(input: $input)
  }
`;
export const claim_start_ticket = /* GraphQL */ `
  mutation Claim_start_ticket($input: ClaimStartTicketInput) {
    claim_start_ticket(input: $input)
  }
`;
export const close_ticket = /* GraphQL */ `
  mutation Close_ticket($input: ClosedTicketInput) {
    close_ticket(input: $input)
  }
`;
export const generate_reports_for_particularWorkflows = /* GraphQL */ `
  mutation Generate_reports_for_particularWorkflows(
    $input: GenerateReportsForParticularWorkflowsInput
  ) {
    generate_reports_for_particularWorkflows(input: $input)
  }
`;
export const generate_expense_reports = /* GraphQL */ `
  mutation Generate_expense_reports($input: GenerateExpenseReportsInput) {
    generate_expense_reports(input: $input)
  }
`;
export const create_booking_resource = /* GraphQL */ `
  mutation Create_booking_resource($input: CreateBookingResourceInput) {
    create_booking_resource(input: $input)
  }
`;
export const edit_and_get_delete_resource = /* GraphQL */ `
  mutation Edit_and_get_delete_resource($input: EditAndGetDeleteResourceInput) {
    edit_and_get_delete_resource(input: $input)
  }
`;
export const export_users = /* GraphQL */ `
  mutation Export_users($input: ExportUsersInput) {
    export_users(input: $input)
  }
`;
export const slot_booking_resource = /* GraphQL */ `
  mutation Slot_booking_resource($input: SlotBookingResourceInput) {
    slot_booking_resource(input: $input)
  }
`;
export const cancel_slot_booking = /* GraphQL */ `
  mutation Cancel_slot_booking($input: CancelSlotBookingInput) {
    cancel_slot_booking(input: $input)
  }
`;
export const create_expense_group = /* GraphQL */ `
  mutation Create_expense_group($input: CreateExpenseGroupInput) {
    create_expense_group(input: $input)
  }
`;
export const add_users_team = /* GraphQL */ `
  mutation Add_users_team($input: AddUsersTeamInput) {
    add_users_team(input: $input)
  }
`;
export const edit_workflow = /* GraphQL */ `
  mutation Edit_workflow($input: EditWorkflowInput) {
    edit_workflow(input: $input)
  }
`;
export const create_activity = /* GraphQL */ `
  mutation Create_activity($input: CreateActivityInput) {
    create_activity(input: $input)
  }
`;
export const create_project = /* GraphQL */ `
  mutation Create_project($input: CreateProjectInput) {
    create_project(input: $input)
  }
`;
export const reassign_tickets = /* GraphQL */ `
  mutation Reassign_tickets($input: ReassignTicketsInput) {
    reassign_tickets(input: $input)
  }
`;
export const edit_group_level_app_visibility = /* GraphQL */ `
  mutation Edit_group_level_app_visibility(
    $input: EditGroupLevelAppVisibilityInput
  ) {
    edit_group_level_app_visibility(input: $input)
  }
`;
export const add_remove_user_to_team = /* GraphQL */ `
  mutation Add_remove_user_to_team($input: AddRemoveUserTeamInput) {
    add_remove_user_to_team(input: $input)
  }
`;
export const email_notification_on_off = /* GraphQL */ `
  mutation Email_notification_on_off($input: EmailNotificationOnOffInput) {
    email_notification_on_off(input: $input)
  }
`;
export const delegation_on_off = /* GraphQL */ `
  mutation Delegation_on_off($input: DelegationOnOffInput) {
    delegation_on_off(input: $input)
  }
`;
export const add_remove_member_dashboard = /* GraphQL */ `
  mutation Add_remove_member_dashboard($input: AddRemoveMemberDashboardInput) {
    add_remove_member_dashboard(input: $input)
  }
`;
export const edit_activities = /* GraphQL */ `
  mutation Edit_activities($input: EditActivitiesInput) {
    edit_activities(input: $input)
  }
`;
export const edit_project_details = /* GraphQL */ `
  mutation Edit_project_details($input: EditProjectDetailsInput) {
    edit_project_details(input: $input)
  }
`;
export const delete_activities = /* GraphQL */ `
  mutation Delete_activities($input: DeleteActivitiesInput) {
    delete_activities(input: $input)
  }
`;
export const delete_projects = /* GraphQL */ `
  mutation Delete_projects($input: DeleteProjectsInput) {
    delete_projects(input: $input)
  }
`;
export const edit_timesheet_manegement_settings = /* GraphQL */ `
  mutation Edit_timesheet_manegement_settings(
    $input: TimesheetManagementInput
  ) {
    edit_timesheet_manegement_settings(input: $input)
  }
`;
export const create_timesheet = /* GraphQL */ `
  mutation Create_timesheet($input: CreateTimesheetInput) {
    create_timesheet(input: $input)
  }
`;
export const update_timesheet = /* GraphQL */ `
  mutation Update_timesheet($input: UpdateTimesheetInput) {
    update_timesheet(input: $input)
  }
`;
export const delete_timesheet = /* GraphQL */ `
  mutation Delete_timesheet($input: DeleteTimesheetInput) {
    delete_timesheet(input: $input)
  }
`;
export const timesheet_reports = /* GraphQL */ `
  mutation Timesheet_reports($input: TimesheetReportsInput) {
    timesheet_reports(input: $input)
  }
`;
export const update_payslip_headers = /* GraphQL */ `
  mutation Update_payslip_headers($input: UpdateHeadersInput) {
    update_payslip_headers(input: $input)
  }
`;
export const bulk_upload_payslips = /* GraphQL */ `
  mutation Bulk_upload_payslips($input: BulkUploadInputs) {
    bulk_upload_payslips(input: $input)
  }
`;
export const edit_delete_payslips = /* GraphQL */ `
  mutation Edit_delete_payslips($input: EditDeletePayslipInputs) {
    edit_delete_payslips(input: $input)
  }
`;
export const asset_categories = /* GraphQL */ `
  mutation Asset_categories($input: AssetCategoriesInput) {
    asset_categories(input: $input)
  }
`;
export const aseet_suppliers = /* GraphQL */ `
  mutation Aseet_suppliers($input: AssetSuppliersInput) {
    aseet_suppliers(input: $input)
  }
`;
export const custom_directory_creation = /* GraphQL */ `
  mutation Custom_directory_creation($input: DirectoryCreationInput) {
    custom_directory_creation(input: $input)
  }
`;
export const custom_directory_design = /* GraphQL */ `
  mutation Custom_directory_design($input: DirectoryDesignInput) {
    custom_directory_design(input: $input)
  }
`;
export const update_directory = /* GraphQL */ `
  mutation Update_directory($input: DirectoryUpdateInput) {
    update_directory(input: $input)
  }
`;
export const delete_directory = /* GraphQL */ `
  mutation Delete_directory($input: DirectoryDeleteInput) {
    delete_directory(input: $input)
  }
`;
export const Entry_for_directory = /* GraphQL */ `
  mutation Entry_for_directory($input: DirectoryEntryInput) {
    Entry_for_directory(input: $input)
  }
`;
export const update_Entry_for_directory = /* GraphQL */ `
  mutation Update_Entry_for_directory($input: DirectoryUpdateEntryInput) {
    update_Entry_for_directory(input: $input)
  }
`;
export const delete_Entry_from_directory = /* GraphQL */ `
  mutation Delete_Entry_from_directory($input: DirectoryDeleteEntryInput) {
    delete_Entry_from_directory(input: $input)
  }
`;
export const subscribe_unsubscribe_from_directory = /* GraphQL */ `
  mutation Subscribe_unsubscribe_from_directory(
    $input: DirectorySubUnsubEntryInput
  ) {
    subscribe_unsubscribe_from_directory(input: $input)
  }
`;
export const asset_sub_category = /* GraphQL */ `
  mutation Asset_sub_category($input: SubcategoryInput) {
    asset_sub_category(input: $input)
  }
`;
export const assets = /* GraphQL */ `
  mutation Assets($input: AssetInput) {
    assets(input: $input)
  }
`;
export const asset_retire = /* GraphQL */ `
  mutation Asset_retire($input: AssetRetireInput) {
    asset_retire(input: $input)
  }
`;
export const update_department = /* GraphQL */ `
  mutation Update_department($input: ChangeDepartmentInputs) {
    update_department(input: $input)
  }
`;
export const bulk_forward_workflow = /* GraphQL */ `
  mutation Bulk_forward_workflow($input: BulkForwardInputs) {
    bulk_forward_workflow(input: $input)
  }
`;
export const asset_configaration = /* GraphQL */ `
  mutation Asset_configaration($input: AssetConfigarationInput) {
    asset_configaration(input: $input)
  }
`;
export const transfer_asset = /* GraphQL */ `
  mutation Transfer_asset($input: TransferAssetInput) {
    transfer_asset(input: $input)
  }
`;
export const handover_asset = /* GraphQL */ `
  mutation Handover_asset($input: HandoverAssetsInput) {
    handover_asset(input: $input)
  }
`;
export const change_directory_of_owner_ship = /* GraphQL */ `
  mutation Change_directory_of_owner_ship($input: DirectoryOwnerChangeInput) {
    change_directory_of_owner_ship(input: $input)
  }
`;
export const slot_category = /* GraphQL */ `
  mutation Slot_category($input: SlotCategoryInputs) {
    slot_category(input: $input)
  }
`;
export const upload_file_s3 = /* GraphQL */ `
  mutation Upload_file_s3($input: UploadFileInput) {
    upload_file_s3(input: $input)
  }
`;
export const create_cabinet_root_folders = /* GraphQL */ `
  mutation Create_cabinet_root_folders($input: CreateRootFoldersInput) {
    create_cabinet_root_folders(input: $input)
  }
`;
export const delete_cabinet = /* GraphQL */ `
  mutation Delete_cabinet($input: DeleteCabinetInputs) {
    delete_cabinet(input: $input)
  }
`;
export const edit_folder_visibility = /* GraphQL */ `
  mutation Edit_folder_visibility($input: EditFolderVisibiltyInputs) {
    edit_folder_visibility(input: $input)
  }
`;
export const ticket_manegement_plots = /* GraphQL */ `
  mutation Ticket_manegement_plots($input: TicketManementPlotsInput) {
    ticket_manegement_plots(input: $input)
  }
`;
export const delete_customers = /* GraphQL */ `
  mutation Delete_customers($input: DeleteCustomersInput) {
    delete_customers(input: $input)
  }
`;
export const request_directory_access = /* GraphQL */ `
  mutation Request_directory_access($input: DirectoryAccessRequestInput) {
    request_directory_access(input: $input)
  }
`;
export const create_stichh_channel = /* GraphQL */ `
  mutation Create_stichh_channel($input: ChannelCreateRequestInput) {
    create_stichh_channel(input: $input)
  }
`;
export const edit_stichh_channel = /* GraphQL */ `
  mutation Edit_stichh_channel($input: ChannelEditRequestInput) {
    edit_stichh_channel(input: $input)
  }
`;
export const delete_stichh_channel = /* GraphQL */ `
  mutation Delete_stichh_channel($input: ChannelDeleteRequestInput) {
    delete_stichh_channel(input: $input)
  }
`;
export const request_channel_access = /* GraphQL */ `
  mutation Request_channel_access($input: ChannelAccessRequestInput) {
    request_channel_access(input: $input)
  }
`;
export const request_folder_access = /* GraphQL */ `
  mutation Request_folder_access($input: RequestFolderAccessInput) {
    request_folder_access(input: $input)
  }
`;
export const transfer_ownership_folder = /* GraphQL */ `
  mutation Transfer_ownership_folder($input: TransferOwnershipInput) {
    transfer_ownership_folder(input: $input)
  }
`;
export const ticket_management_reports = /* GraphQL */ `
  mutation Ticket_management_reports($input: TicketMangementInputs) {
    ticket_management_reports(input: $input)
  }
`;
export const createDashboard_v1 = /* GraphQL */ `
  mutation CreateDashboard_v1($input: CreateDashboardV1Input) {
    createDashboard_v1(input: $input)
  }
`;
export const edit_dashboard_details = /* GraphQL */ `
  mutation Edit_dashboard_details($input: EditDashboardDetailsInputs) {
    edit_dashboard_details(input: $input)
  }
`;
export const request_access_dashboard = /* GraphQL */ `
  mutation Request_access_dashboard($input: RequestAccessDashboardInput) {
    request_access_dashboard(input: $input)
  }
`;
export const transfer_ownership_dashboard = /* GraphQL */ `
  mutation Transfer_ownership_dashboard(
    $input: TransferOwnershipDashboardInputs
  ) {
    transfer_ownership_dashboard(input: $input)
  }
`;
export const change_ownership_channel = /* GraphQL */ `
  mutation Change_ownership_channel($input: ChannelTransferOwnershipInput) {
    change_ownership_channel(input: $input)
  }
`;
export const bulk_reject_workflows = /* GraphQL */ `
  mutation Bulk_reject_workflows($input: BulkRejectWorkflowsInputs) {
    bulk_reject_workflows(input: $input)
  }
`;
export const user_swipes_capture = /* GraphQL */ `
  mutation User_swipes_capture($input: UserSwipesCaptureInputs) {
    user_swipes_capture(input: $input)
  }
`;
export const dashboard_sections = /* GraphQL */ `
  mutation Dashboard_sections($input: DashboardSectionsInputs) {
    dashboard_sections(input: $input)
  }
`;
export const asset_genrate_list_print_qrs = /* GraphQL */ `
  mutation Asset_genrate_list_print_qrs(
    $input: AssetGenrateListPrintQrsInputs
  ) {
    asset_genrate_list_print_qrs(input: $input)
  }
`;
export const create_tv_board = /* GraphQL */ `
  mutation Create_tv_board($input: CreateTVBoardInputs) {
    create_tv_board(input: $input)
  }
`;
export const edit_tv_board_details = /* GraphQL */ `
  mutation Edit_tv_board_details($input: EditTvBoardDetailsInputs) {
    edit_tv_board_details(input: $input)
  }
`;
export const asset_config_create_list_update_locations = /* GraphQL */ `
  mutation Asset_config_create_list_update_locations(
    $input: AssetConfigCreateListUpdateLocationsInputs
  ) {
    asset_config_create_list_update_locations(input: $input)
  }
`;
export const draft_custom_form = /* GraphQL */ `
  mutation Draft_custom_form($input: DraftCutomFormInputs) {
    draft_custom_form(input: $input)
  }
`;
export const create_list_edit_delete_asset_distributors = /* GraphQL */ `
  mutation Create_list_edit_delete_asset_distributors(
    $input: CreateListEditDeleteDistributorsInputs
  ) {
    create_list_edit_delete_asset_distributors(input: $input)
  }
`;
export const create_list_edit_delete_asset_retailers = /* GraphQL */ `
  mutation Create_list_edit_delete_asset_retailers(
    $input: CreateListEditDeleteRetailersInputs
  ) {
    create_list_edit_delete_asset_retailers(input: $input)
  }
`;
export const create_list_delete_tags = /* GraphQL */ `
  mutation Create_list_delete_tags($input: CreateListEditDeleteTagsInputs) {
    create_list_delete_tags(input: $input)
  }
`;
export const create_list_delete_sub_tags = /* GraphQL */ `
  mutation Create_list_delete_sub_tags(
    $input: CreateListEditDeleteSubTagsInputs
  ) {
    create_list_delete_sub_tags(input: $input)
  }
`;
export const configure_asset_workflows = /* GraphQL */ `
  mutation Configure_asset_workflows($input: ConfigureAssetWorkflowsInputs) {
    configure_asset_workflows(input: $input)
  }
`;
export const initiate_asset_request = /* GraphQL */ `
  mutation Initiate_asset_request($input: InitiateAssetRequestInputs) {
    initiate_asset_request(input: $input)
  }
`;
export const initiate_asset_procure_request = /* GraphQL */ `
  mutation Initiate_asset_procure_request(
    $input: InitiateAssetProcureRequestInputs
  ) {
    initiate_asset_procure_request(input: $input)
  }
`;
export const update_user_presence_settings = /* GraphQL */ `
  mutation Update_user_presence_settings(
    $input: UpdateUserPresenceSettingsInputs
  ) {
    update_user_presence_settings(input: $input)
  }
`;
export const initiate_dispatch_request = /* GraphQL */ `
  mutation Initiate_dispatch_request($input: InitiateDispatchRequestInputs) {
    initiate_dispatch_request(input: $input)
  }
`;
export const aging_forward_workflow = /* GraphQL */ `
  mutation Aging_forward_workflow($input: AgingBulkForwardInputs) {
    aging_forward_workflow(input: $input)
  }
`;
export const aging_knockoff_workflow = /* GraphQL */ `
  mutation Aging_knockoff_workflow($input: AgingKnockoffInputs) {
    aging_knockoff_workflow(input: $input)
  }
`;
export const approve_reject_requested_assets = /* GraphQL */ `
  mutation Approve_reject_requested_assets(
    $input: ApproveRejectRequestedAssetsInputs
  ) {
    approve_reject_requested_assets(input: $input)
  }
`;
export const create_custom_holidays = /* GraphQL */ `
  mutation Create_custom_holidays($input: CreateCustomHolidaysInputs) {
    create_custom_holidays(input: $input)
  }
`;
export const territory_creation = /* GraphQL */ `
  mutation Territory_creation($input: CreateTerritorynputs) {
    territory_creation(input: $input)
  }
`;
export const Visit_type_creation = /* GraphQL */ `
  mutation Visit_type_creation($input: CreateVisittypeinputs) {
    Visit_type_creation(input: $input)
  }
`;
export const edit_visittype_form = /* GraphQL */ `
  mutation Edit_visittype_form($input: EditVisitTypeFormInputs) {
    edit_visittype_form(input: $input)
  }
`;
export const delete_territories = /* GraphQL */ `
  mutation Delete_territories($input: DeleteTerritorynputs) {
    delete_territories(input: $input)
  }
`;
export const edit_territories = /* GraphQL */ `
  mutation Edit_territories($input: EditTerritorynputs) {
    edit_territories(input: $input)
  }
`;
export const delete_visitType = /* GraphQL */ `
  mutation Delete_visitType($input: DeletevisitTypenputs) {
    delete_visitType(input: $input)
  }
`;
export const edit_visittype = /* GraphQL */ `
  mutation Edit_visittype($input: EditvisitTypenputs) {
    edit_visittype(input: $input)
  }
`;
export const create_list_edit_territories = /* GraphQL */ `
  mutation Create_list_edit_territories(
    $input: CreateListEditTerritoriesInputs
  ) {
    create_list_edit_territories(input: $input)
  }
`;
export const add_visit_location = /* GraphQL */ `
  mutation Add_visit_location($input: CreateLocationinputs) {
    add_visit_location(input: $input)
  }
`;
export const create_list_edit_location_type = /* GraphQL */ `
  mutation Create_list_edit_location_type(
    $input: CreateListEditLocationTypeInputs
  ) {
    create_list_edit_location_type(input: $input)
  }
`;
export const create_visit_locations = /* GraphQL */ `
  mutation Create_visit_locations($input: CreateVisitLocationsInputs) {
    create_visit_locations(input: $input)
  }
`;
export const create_visit_reps = /* GraphQL */ `
  mutation Create_visit_reps($input: CreateVisitRepsInputs) {
    create_visit_reps(input: $input)
  }
`;
export const edit_visit_locations = /* GraphQL */ `
  mutation Edit_visit_locations($input: EditVisitLocationsInputs) {
    edit_visit_locations(input: $input)
  }
`;
export const edit_visit_reps = /* GraphQL */ `
  mutation Edit_visit_reps($input: EditVisitRepsInpts) {
    edit_visit_reps(input: $input)
  }
`;
export const approve_rejct_unverified_loc = /* GraphQL */ `
  mutation Approve_rejct_unverified_loc($input: ApproveRejectLocInuts) {
    approve_rejct_unverified_loc(input: $input)
  }
`;
export const create_list_edit_delete_products = /* GraphQL */ `
  mutation Create_list_edit_delete_products(
    $input: createListDeleteProductsInputs
  ) {
    create_list_edit_delete_products(input: $input)
  }
`;
export const create_list_edit_delete_project_site = /* GraphQL */ `
  mutation Create_list_edit_delete_project_site(
    $input: createListDeleteProjectSiteInputs
  ) {
    create_list_edit_delete_project_site(input: $input)
  }
`;
export const create_list_edit_delete_material = /* GraphQL */ `
  mutation Create_list_edit_delete_material(
    $input: createListDeleteMaterialInputs
  ) {
    create_list_edit_delete_material(input: $input)
  }
`;
export const create_project_site_user = /* GraphQL */ `
  mutation Create_project_site_user($input: CreateProjectSiteuserInputs) {
    create_project_site_user(input: $input)
  }
`;
export const edit_delete_project_site_users = /* GraphQL */ `
  mutation Edit_delete_project_site_users(
    $input: EditDeleleProjectsiteUsersInputs
  ) {
    edit_delete_project_site_users(input: $input)
  }
`;
export const add_update_material_to_stock = /* GraphQL */ `
  mutation Add_update_material_to_stock($input: AddUpdateMaterialStockInputs) {
    add_update_material_to_stock(input: $input)
  }
`;
export const configure_visit_workflows = /* GraphQL */ `
  mutation Configure_visit_workflows($input: ConfigureVisitWorkflowsInputs) {
    configure_visit_workflows(input: $input)
  }
`;
export const delete_Material_Stock = /* GraphQL */ `
  mutation Delete_Material_Stock($input: DeleteMaterialStockInputs) {
    delete_Material_Stock(input: $input)
  }
`;
export const dispatch_Material_Stock = /* GraphQL */ `
  mutation Dispatch_Material_Stock($input: DispatchMaterialFromStockInputs) {
    dispatch_Material_Stock(input: $input)
  }
`;
export const create_list_edit_delete_units = /* GraphQL */ `
  mutation Create_list_edit_delete_units($input: createListDeleteUnitsInputs) {
    create_list_edit_delete_units(input: $input)
  }
`;
export const Revert_Transactions_Admin = /* GraphQL */ `
  mutation Revert_Transactions_Admin($input: RevertTransactionsAdminInputs) {
    Revert_Transactions_Admin(input: $input)
  }
`;
export const request_cancel_leave = /* GraphQL */ `
  mutation Request_cancel_leave($input: RequestCancelLeaveInputs) {
    request_cancel_leave(input: $input)
  }
`;
export const create_all_projects = /* GraphQL */ `
  mutation Create_all_projects($input: CreateAllProjectsInputs) {
    create_all_projects(input: $input)
  }
`;
export const edit_project = /* GraphQL */ `
  mutation Edit_project($input: EditProjectInputs) {
    edit_project(input: $input)
  }
`;
export const update_project_status = /* GraphQL */ `
  mutation Update_project_status($input: UpdateProjectStatusInputs) {
    update_project_status(input: $input)
  }
`;
export const create_list_edit_phase_tasks = /* GraphQL */ `
  mutation Create_list_edit_phase_tasks($input: CreateListEditTasksInputs) {
    create_list_edit_phase_tasks(input: $input)
  }
`;
export const create_list_edit_phases = /* GraphQL */ `
  mutation Create_list_edit_phases($input: CreateListEditPhasesInputs) {
    create_list_edit_phases(input: $input)
  }
`;
export const initiate_purchase_request = /* GraphQL */ `
  mutation Initiate_purchase_request($input: InitiatePurchaseRequestInputs) {
    initiate_purchase_request(input: $input)
  }
`;
export const apprv_rej_purchase_orders = /* GraphQL */ `
  mutation Apprv_rej_purchase_orders($input: ApprvRejectPurchaseOrdersInputs) {
    apprv_rej_purchase_orders(input: $input)
  }
`;
export const update_apps_details_organization = /* GraphQL */ `
  mutation Update_apps_details_organization(
    $input: UpdateAppsDetailsOrganizationInputs
  ) {
    update_apps_details_organization(input: $input)
  }
`;
export const create_presence_qrs = /* GraphQL */ `
  mutation Create_presence_qrs($input: CreatePresenceQrsInputs) {
    create_presence_qrs(input: $input)
  }
`;
export const edit_user_app_access = /* GraphQL */ `
  mutation Edit_user_app_access($input: EditUserAppAccessInputs) {
    edit_user_app_access(input: $input)
  }
`;
export const create_edit_delete_cargo_space = /* GraphQL */ `
  mutation Create_edit_delete_cargo_space(
    $input: createEditDeleteCargoSpaceInputs
  ) {
    create_edit_delete_cargo_space(input: $input)
  }
`;
export const create_edit_delete_cargo_items = /* GraphQL */ `
  mutation Create_edit_delete_cargo_items(
    $input: createEditDeleteCargoItemsInputs
  ) {
    create_edit_delete_cargo_items(input: $input)
  }
`;
export const register_guest_house = /* GraphQL */ `
  mutation Register_guest_house($input: registerGuestHouseInputs) {
    register_guest_house(input: $input)
  }
`;
export const update_guest_house_details = /* GraphQL */ `
  mutation Update_guest_house_details($input: updateGuestHouseDetailsInputs) {
    update_guest_house_details(input: $input)
  }
`;
export const create_update_calender = /* GraphQL */ `
  mutation Create_update_calender($input: CreateUpdateCalenderInputs) {
    create_update_calender(input: $input)
  }
`;
export const AddUserToTeam = /* GraphQL */ `
  mutation AddUserToTeam($input: AddUserToTeamInputs) {
    AddUserToTeam(input: $input)
  }
`;
export const ExitFromGroupchat = /* GraphQL */ `
  mutation ExitFromGroupchat($input: ExitFromGroupchatInputs) {
    ExitFromGroupchat(input: $input)
  }
`;
export const customer_function = /* GraphQL */ `
  mutation Customer_function($input: customerFunctionInputs) {
    customer_function(input: $input)
  }
`;
export const initiate_customer_transaction = /* GraphQL */ `
  mutation Initiate_customer_transaction(
    $input: initiateCustomerTransactionInputs
  ) {
    initiate_customer_transaction(input: $input)
  }
`;
export const initiate_supplier_transaction = /* GraphQL */ `
  mutation Initiate_supplier_transaction(
    $input: initiateSupplierTransactionInputs
  ) {
    initiate_supplier_transaction(input: $input)
  }
`;
export const update_amount_collection_date = /* GraphQL */ `
  mutation Update_amount_collection_date(
    $input: updateAmountCollectionDateInputs
  ) {
    update_amount_collection_date(input: $input)
  }
`;
export const items_categories = /* GraphQL */ `
  mutation Items_categories($input: itemCategoriesInputs) {
    items_categories(input: $input)
  }
`;
export const quotation_sub_categories = /* GraphQL */ `
  mutation Quotation_sub_categories($input: QuotionSubCategoriesInputs) {
    quotation_sub_categories(input: $input)
  }
`;
export const quotation_terms_conditions = /* GraphQL */ `
  mutation Quotation_terms_conditions($input: QuotationTermsConditionsInputs) {
    quotation_terms_conditions(input: $input)
  }
`;
export const genrate_list_quotaions_bills = /* GraphQL */ `
  mutation Genrate_list_quotaions_bills(
    $input: GenrateListQuotationBillsInputs
  ) {
    genrate_list_quotaions_bills(input: $input)
  }
`;
export const genrate_api_key = /* GraphQL */ `
  mutation Genrate_api_key($input: GenrateApiKeyInputs) {
    genrate_api_key(input: $input)
  }
`;
export const quotation_billing_entities = /* GraphQL */ `
  mutation Quotation_billing_entities($input: QuotationBillingEntitiesInputs) {
    quotation_billing_entities(input: $input)
  }
`;
export const update_list_email_templates = /* GraphQL */ `
  mutation Update_list_email_templates($input: UpdateListEmailTemplatesInputs) {
    update_list_email_templates(input: $input)
  }
`;
export const stichh_kiosk_function = /* GraphQL */ `
  mutation Stichh_kiosk_function($input: stichhKioskFunctionInputs) {
    stichh_kiosk_function(input: $input)
  }
`;
export const bulk_upload_members = /* GraphQL */ `
  mutation Bulk_upload_members($input: bulkUploadMembersInputs) {
    bulk_upload_members(input: $input)
  }
`;
export const reverse_customer_transaction = /* GraphQL */ `
  mutation Reverse_customer_transaction(
    $input: reverseCustomerTransactionInputs
  ) {
    reverse_customer_transaction(input: $input)
  }
`;
export const reverse_supplier_transaction = /* GraphQL */ `
  mutation Reverse_supplier_transaction(
    $input: reverseSupplierTransactionInputs
  ) {
    reverse_supplier_transaction(input: $input)
  }
`;
export const list_project_management_timesheets = /* GraphQL */ `
  mutation List_project_management_timesheets(
    $input: listProjectManagementTimesheetsInputs
  ) {
    list_project_management_timesheets(input: $input)
  }
`;
export const restart_workflow = /* GraphQL */ `
  mutation Restart_workflow($input: restartWorkflowInputs) {
    restart_workflow(input: $input)
  }
`;
export const update_vendor_workflows = /* GraphQL */ `
  mutation Update_vendor_workflows($input: updateVendorWorkflowsInputs) {
    update_vendor_workflows(input: $input)
  }
`;
export const initiate_vendor_reimbursement = /* GraphQL */ `
  mutation Initiate_vendor_reimbursement(
    $input: initiateVendorReimbursementInputs
  ) {
    initiate_vendor_reimbursement(input: $input)
  }
`;
export const add_update_product_to_stock = /* GraphQL */ `
  mutation Add_update_product_to_stock($input: addUpdateProductToStockInputs) {
    add_update_product_to_stock(input: $input)
  }
`;
export const Consume_Products = /* GraphQL */ `
  mutation Consume_Products($input: ConsumeProductsInputs) {
    Consume_Products(input: $input)
  }
`;
export const update_location_Stock_space = /* GraphQL */ `
  mutation Update_location_Stock_space($input: updateLocationStockSpaceInputs) {
    update_location_Stock_space(input: $input)
  }
`;
export const IMPORT_EXCEL_TO_DIRECTORY = /* GraphQL */ `
  mutation IMPORT_EXCEL_TO_DIRECTORY($input: ImportExcelToDirectoryeInputs) {
    IMPORT_EXCEL_TO_DIRECTORY(input: $input)
  }
`;
export const Initiate_Reorder = /* GraphQL */ `
  mutation Initiate_Reorder($input: InitiateReorderInputs) {
    Initiate_Reorder(input: $input)
  }
`;
export const update_list_kiosk_priority_message = /* GraphQL */ `
  mutation Update_list_kiosk_priority_message(
    $input: updateListKioskPriorityMessageInputs
  ) {
    update_list_kiosk_priority_message(input: $input)
  }
`;
export const create_orders = /* GraphQL */ `
  mutation Create_orders($input: createOrdersInputs) {
    create_orders(input: $input)
  }
`;
export const edit_orders = /* GraphQL */ `
  mutation Edit_orders($input: editOrdersInputs) {
    edit_orders(input: $input)
  }
`;
export const delete_orders = /* GraphQL */ `
  mutation Delete_orders($input: deleteOrdersInputs) {
    delete_orders(input: $input)
  }
`;
export const update_list_order_email_templates = /* GraphQL */ `
  mutation Update_list_order_email_templates(
    $input: updateListOrderEmailTemplatesInputs
  ) {
    update_list_order_email_templates(input: $input)
  }
`;
export const audit_log_capture = /* GraphQL */ `
  mutation Audit_log_capture($input: auditLogCaptureInputs) {
    audit_log_capture(input: $input)
  }
`;
export const map_rfid_location = /* GraphQL */ `
  mutation Map_rfid_location($input: mapRfidLocationInputs) {
    map_rfid_location(input: $input)
  }
`;
export const update_rfid_location = /* GraphQL */ `
  mutation Update_rfid_location($input: updateRfidLocationInputs) {
    update_rfid_location(input: $input)
  }
`;
export const update_user_rfid_details = /* GraphQL */ `
  mutation Update_user_rfid_details($input: updateUserRfidDetails) {
    update_user_rfid_details(input: $input)
  }
`;
export const edit_presence_visitors = /* GraphQL */ `
  mutation Edit_presence_visitors($input: editPresenceVisitorDetailsInputs) {
    edit_presence_visitors(input: $input)
  }
`;
export const bulk_upload_customers = /* GraphQL */ `
  mutation Bulk_upload_customers($input: bulkUploadCustomersInputs) {
    bulk_upload_customers(input: $input)
  }
`;
export const create_organization_prefixs = /* GraphQL */ `
  mutation Create_organization_prefixs(
    $input: createOrganizationPrefixsInputs
  ) {
    create_organization_prefixs(input: $input)
  }
`;
export const bulk_upload_vendors = /* GraphQL */ `
  mutation Bulk_upload_vendors($input: bulkUploadVendorsInputs) {
    bulk_upload_vendors(input: $input)
  }
`;
export const initiate_project_transfer_ownership = /* GraphQL */ `
  mutation Initiate_project_transfer_ownership(
    $input: initiateProjectTransferOwnershipInput
  ) {
    initiate_project_transfer_ownership(input: $input)
  }
`;
export const create_master_checklists = /* GraphQL */ `
  mutation Create_master_checklists($input: createMasterChecklistInputs) {
    create_master_checklists(input: $input)
  }
`;
export const edit_master_checklists = /* GraphQL */ `
  mutation Edit_master_checklists($input: editMasterChecklistInputs) {
    edit_master_checklists(input: $input)
  }
`;
export const create_checklists = /* GraphQL */ `
  mutation Create_checklists($input: createChecklistsInputs) {
    create_checklists(input: $input)
  }
`;
export const update_checklist = /* GraphQL */ `
  mutation Update_checklist($input: updateChecklistInputs) {
    update_checklist(input: $input)
  }
`;
export const update_user_checklists = /* GraphQL */ `
  mutation Update_user_checklists($input: updateUserChecklistsInputs) {
    update_user_checklists(input: $input)
  }
`;
export const genrate_proforma_invoice = /* GraphQL */ `
  mutation Genrate_proforma_invoice($input: genrateProformaInvoiceInputs) {
    genrate_proforma_invoice(input: $input)
  }
`;
export const request_and_log_pettycash = /* GraphQL */ `
  mutation Request_and_log_pettycash($input: requestLogpettyCashInputs) {
    request_and_log_pettycash(input: $input)
  }
`;
export const edit_presence_qrs = /* GraphQL */ `
  mutation Edit_presence_qrs($input: editPresenceQrsInputs) {
    edit_presence_qrs(input: $input)
  }
`;
export const manage_awards = /* GraphQL */ `
  mutation Manage_awards($input: manageAwardsInputs) {
    manage_awards(input: $input)
  }
`;
export const get_awards_and_leaderboard = /* GraphQL */ `
  mutation Get_awards_and_leaderboard($input: getAwardsAndLeaderboardInputs) {
    get_awards_and_leaderboard(input: $input)
  }
`;
export const awards_and_recognition_workflow_configure = /* GraphQL */ `
  mutation Awards_and_recognition_workflow_configure(
    $input: ConfigureAwardsWorkflowsInputs
  ) {
    awards_and_recognition_workflow_configure(input: $input)
  }
`;
export const manage_awards_policies = /* GraphQL */ `
  mutation Manage_awards_policies($input: manageAwardsPoliciesInputs!) {
    manage_awards_policies(input: $input)
  }
`;
export const add_remove_member_cabinet = /* GraphQL */ `
  mutation Add_remove_member_cabinet($input: AddRemoveMembersCabinetInputs) {
    add_remove_member_cabinet(input: $input)
  }
`;
export const initiate_org_refill_vault_request = /* GraphQL */ `
  mutation Initiate_org_refill_vault_request(
    $input: initiateOrgRefillRequestInputs
  ) {
    initiate_org_refill_vault_request(input: $input)
  }
`;
export const create_list_update_org_prefix = /* GraphQL */ `
  mutation Create_list_update_org_prefix(
    $input: createOrganizationPrefixsInputs
  ) {
    create_list_update_org_prefix(input: $input)
  }
`;
export const organization_sales_purchase_config = /* GraphQL */ `
  mutation Organization_sales_purchase_config(
    $input: orgnizationSalesPurchaseCongigInputs
  ) {
    organization_sales_purchase_config(input: $input)
  }
`;
export const create_items = /* GraphQL */ `
  mutation Create_items($input: createItemsInputs) {
    create_items(input: $input)
  }
`;
export const edit_items = /* GraphQL */ `
  mutation Edit_items($input: editItemsInputs) {
    edit_items(input: $input)
  }
`;
export const add_reduce_item_quantity = /* GraphQL */ `
  mutation Add_reduce_item_quantity($input: addReduceItemQuantityInputs) {
    add_reduce_item_quantity(input: $input)
  }
`;
export const create_sale_order_quotations = /* GraphQL */ `
  mutation Create_sale_order_quotations(
    $input: createSaleOrderQuotationInputs
  ) {
    create_sale_order_quotations(input: $input)
  }
`;
export const edit_sale_order_quotations = /* GraphQL */ `
  mutation Edit_sale_order_quotations($input: editSaleOrderQuotationInputs) {
    edit_sale_order_quotations(input: $input)
  }
`;
export const export_audit_trail = /* GraphQL */ `
  mutation Export_audit_trail($input: exportAuditTrailInput) {
    export_audit_trail(input: $input)
  }
`;
export const payment_in_transactions = /* GraphQL */ `
  mutation Payment_in_transactions($input: paymentInTransactionsInputs) {
    payment_in_transactions(input: $input)
  }
`;
export const Team_awards_workflow_configure = /* GraphQL */ `
  mutation Team_awards_workflow_configure(
    $input: ConfigureAwardsWorkflowsInputs
  ) {
    Team_awards_workflow_configure(input: $input)
  }
`;
export const create_purchase_order = /* GraphQL */ `
  mutation Create_purchase_order($input: createPurchaseOrderInputs) {
    create_purchase_order(input: $input)
  }
`;
export const edit_purchase_order = /* GraphQL */ `
  mutation Edit_purchase_order($input: editPurchaseOrderInputs) {
    edit_purchase_order(input: $input)
  }
`;
export const payment_out_transactions = /* GraphQL */ `
  mutation Payment_out_transactions($input: paymentOutTransactionsInputs) {
    payment_out_transactions(input: $input)
  }
`;
export const create_list_nominations = /* GraphQL */ `
  mutation Create_list_nominations($input: createListNominationsInputs) {
    create_list_nominations(input: $input)
  }
`;
export const create_team_nominations = /* GraphQL */ `
  mutation Create_team_nominations($input: createTeamNominationsInput) {
    create_team_nominations(input: $input)
  }
`;
export const create_crm_leads = /* GraphQL */ `
  mutation Create_crm_leads($input: createCrmLeadsInputs) {
    create_crm_leads(input: $input)
  }
`;
export const edit_crm_lead_details = /* GraphQL */ `
  mutation Edit_crm_lead_details($input: editCrmLeadDetailsInputs) {
    edit_crm_lead_details(input: $input)
  }
`;
export const create_list_edit_delete_priority = /* GraphQL */ `
  mutation Create_list_edit_delete_priority($input: CrudPriorotyInput) {
    create_list_edit_delete_priority(input: $input)
  }
`;
export const create_list_edit_delete_ticket_type = /* GraphQL */ `
  mutation Create_list_edit_delete_ticket_type($input: CrudTicketTypeInput) {
    create_list_edit_delete_ticket_type(input: $input)
  }
`;
export const create_list_edit_delete_category = /* GraphQL */ `
  mutation Create_list_edit_delete_category($input: CrudCategoryInput) {
    create_list_edit_delete_category(input: $input)
  }
`;
export const create_list_edit_delete_sla_rule = /* GraphQL */ `
  mutation Create_list_edit_delete_sla_rule($input: CrudSLAInput) {
    create_list_edit_delete_sla_rule(input: $input)
  }
`;
export const create_list_edit_delete_work_schedule = /* GraphQL */ `
  mutation Create_list_edit_delete_work_schedule(
    $input: CrudWorkScheduleInput
  ) {
    create_list_edit_delete_work_schedule(input: $input)
  }
`;
export const create_ticket = /* GraphQL */ `
  mutation Create_ticket($input: CreateTicketInput) {
    create_ticket(input: $input)
  }
`;
export const update_ticket = /* GraphQL */ `
  mutation Update_ticket($input: UpdateTicketInput) {
    update_ticket(input: $input)
  }
`;
export const assign_ticket = /* GraphQL */ `
  mutation Assign_ticket($input: AssignTicketInput) {
    assign_ticket(input: $input)
  }
`;
export const claim_external_ticket = /* GraphQL */ `
  mutation Claim_external_ticket($input: ClaimExternalTicketInput) {
    claim_external_ticket(input: $input)
  }
`;
export const delete_ticket = /* GraphQL */ `
  mutation Delete_ticket($input: DeleteTicketInput) {
    delete_ticket(input: $input)
  }
`;
export const create_list_edit_delete_ticket_status = /* GraphQL */ `
  mutation Create_list_edit_delete_ticket_status(
    $input: CrudticketStatusInput
  ) {
    create_list_edit_delete_ticket_status(input: $input)
  }
`;
export const create_list_edit_delete_ticket_prefix = /* GraphQL */ `
  mutation Create_list_edit_delete_ticket_prefix(
    $input: CrudticketprefixInput
  ) {
    create_list_edit_delete_ticket_prefix(input: $input)
  }
`;
export const generate_all_tickets_excel_report = /* GraphQL */ `
  mutation Generate_all_tickets_excel_report(
    $input: generateAllTicketsExcelReportInput!
  ) {
    generate_all_tickets_excel_report(input: $input)
  }
`;
export const generate_my_tickets_excel_report = /* GraphQL */ `
  mutation Generate_my_tickets_excel_report(
    $input: generateMyTicketsExcelReportInput!
  ) {
    generate_my_tickets_excel_report(input: $input)
  }
`;
export const create_list_edit_bussinesstype = /* GraphQL */ `
  mutation Create_list_edit_bussinesstype(
    $input: CreateListEditBussinessTypeInputs
  ) {
    create_list_edit_bussinesstype(input: $input)
  }
`;
export const attendence_report_configuration = /* GraphQL */ `
  mutation Attendence_report_configuration(
    $input: AttendenceReportConfigurationInput!
  ) {
    attendence_report_configuration(input: $input)
  }
`;
export const create_list_edit_delete_work_shift_timings = /* GraphQL */ `
  mutation Create_list_edit_delete_work_shift_timings(
    $input: CrudWorkshiftTimingsInput
  ) {
    create_list_edit_delete_work_shift_timings(input: $input)
  }
`;
export const bulk_upload_items = /* GraphQL */ `
  mutation Bulk_upload_items($input: bulkUploadItemsInputs) {
    bulk_upload_items(input: $input)
  }
`;
export const create_list_edit_delete_splay_questions = /* GraphQL */ `
  mutation Create_list_edit_delete_splay_questions(
    $input: CrudSplayQuestionInput
  ) {
    create_list_edit_delete_splay_questions(input: $input)
  }
`;
export const create_list_edit_delete_splay_categories = /* GraphQL */ `
  mutation Create_list_edit_delete_splay_categories(
    $input: CrudSplayCategoryInput
  ) {
    create_list_edit_delete_splay_categories(input: $input)
  }
`;
export const workflow_bulk_approve = /* GraphQL */ `
  mutation Workflow_bulk_approve($input: workflowBulkApproveInputs) {
    workflow_bulk_approve(input: $input)
  }
`;
export const schedule_game = /* GraphQL */ `
  mutation Schedule_game($input: scheduleGameInput) {
    schedule_game(input: $input)
  }
`;
export const export_inventory_items = /* GraphQL */ `
  mutation Export_inventory_items($input: exportInventoryItemsInputs) {
    export_inventory_items(input: $input)
  }
`;
export const export_participant_workflows = /* GraphQL */ `
  mutation Export_participant_workflows(
    $input: exportParticipantWorkflowsInputs
  ) {
    export_participant_workflows(input: $input)
  }
`;
export const delete_scheduled_game = /* GraphQL */ `
  mutation Delete_scheduled_game($input: DeleteScheduledGameInput) {
    delete_scheduled_game(input: $input)
  }
`;
export const manage_splay_awards_policies = /* GraphQL */ `
  mutation Manage_splay_awards_policies(
    $input: manageSplayAwardsPoliciesInputs!
  ) {
    manage_splay_awards_policies(input: $input)
  }
`;
export const splay_leaderboard_management = /* GraphQL */ `
  mutation Splay_leaderboard_management(
    $input: splayLeaderboardManagementInput
  ) {
    splay_leaderboard_management(input: $input)
  }
`;
export const custom_timesheet_reports = /* GraphQL */ `
  mutation Custom_timesheet_reports($input: CustomTimesheetReportsInput!) {
    custom_timesheet_reports(input: $input)
  }
`;
export const generate_multiple_projects_reports = /* GraphQL */ `
  mutation Generate_multiple_projects_reports(
    $input: GenerateMultipleProjectsReportsInput!
  ) {
    generate_multiple_projects_reports(input: $input)
  }
`;
export const generate_pdf_reports_for_particular_workflows = /* GraphQL */ `
  mutation Generate_pdf_reports_for_particular_workflows(
    $input: generatePdfReportsForParticularWorkflowsInput
  ) {
    generate_pdf_reports_for_particular_workflows(input: $input)
  }
`;
export const inventory_categories_CRUD = /* GraphQL */ `
  mutation Inventory_categories_CRUD($input: InventoryCategoriesInput) {
    inventory_categories_CRUD(input: $input)
  }
`;
export const inventory_products_CRUD = /* GraphQL */ `
  mutation Inventory_products_CRUD($input: InventoryProductsCRUDInput) {
    inventory_products_CRUD(input: $input)
  }
`;
export const restock_Inventory = /* GraphQL */ `
  mutation Restock_Inventory($input: RestockInventoryInput) {
    restock_Inventory(input: $input)
  }
`;
export const consume_Inventory = /* GraphQL */ `
  mutation Consume_Inventory($input: ConsumeInventoryInput) {
    consume_Inventory(input: $input)
  }
`;
export const transfer_Inventory = /* GraphQL */ `
  mutation Transfer_Inventory($input: TransferInventoryInput) {
    transfer_Inventory(input: $input)
  }
`;
export const trigger_Initiate_Reorder = /* GraphQL */ `
  mutation Trigger_Initiate_Reorder($input: TriggerInitiateReorderInput) {
    trigger_Initiate_Reorder(input: $input)
  }
`;
export const create_list_edit_delete_material_unit = /* GraphQL */ `
  mutation Create_list_edit_delete_material_unit(
    $input: createListDeleteMaterialUnitsInputs
  ) {
    create_list_edit_delete_material_unit(input: $input)
  }
`;
export const update_project_notification_settings = /* GraphQL */ `
  mutation Update_project_notification_settings(
    $input: UpdateProjectNotificationSettingsInput!
  ) {
    update_project_notification_settings(input: $input)
  }
`;
export const group_presence_reports = /* GraphQL */ `
  mutation Group_presence_reports($input: GroupPresenceReportsInput) {
    group_presence_reports(input: $input)
  }
`;
export const export_leaderboard_by_month = /* GraphQL */ `
  mutation Export_leaderboard_by_month($input: exportLeaderboardByMonthInputs) {
    export_leaderboard_by_month(input: $input)
  }
`;
export const create_worktype = /* GraphQL */ `
  mutation Create_worktype($input: CreateWorktypeInput!) {
    create_worktype(input: $input)
  }
`;
export const design_worktype = /* GraphQL */ `
  mutation Design_worktype($input: DesignWorktypeInput!) {
    design_worktype(input: $input)
  }
`;
export const add_worktype = /* GraphQL */ `
  mutation Add_worktype($input: AddWorktypeInput!) {
    add_worktype(input: $input)
  }
`;
export const tag_worktype = /* GraphQL */ `
  mutation Tag_worktype($input: TagWorktypeInput!) {
    tag_worktype(input: $input)
  }
`;
export const delete_worktype_form = /* GraphQL */ `
  mutation Delete_worktype_form($input: deleteWorktypeFormInput) {
    delete_worktype_form(input: $input)
  }
`;
export const delete_worktype = /* GraphQL */ `
  mutation Delete_worktype($input: deleteWorktypeInput) {
    delete_worktype(input: $input)
  }
`;
