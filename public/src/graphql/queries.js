/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const list_users = /* GraphQL */ `
  query List_users(
    $limit: Int
    $nextToken: String
    $organization_id: String!
    $user_status: enumuserstatususe
    $user_type: enumusertype
    $name_search: String
    $user_email_id: String
    $user_contact_number: String
    $reporting_manager: String
    $member_id: String
  ) {
    list_users(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      user_status: $user_status
      user_type: $user_type
      name_search: $name_search
      user_email_id: $user_email_id
      user_contact_number: $user_contact_number
      reporting_manager: $reporting_manager
      member_id: $member_id
    ) {
      details {
        user_id
        first_name
        full_user_name
        identity_expiry_date
        identity_number
        nationality
        insurance_id
        insurance_name
        government_id
        is_notification
        last_name
        member_id
        organization_id
        alternative_contact_number
        alternative_country_code
        blood_group
        date_of_birth
        gender
        address_1
        address_2
        city
        country
        state
        permanent_address
        team_visibilty
        user_contact_number
        user_country_code
        user_created_on
        user_email_id
        user_full_contact_number
        user_status
        user_type
        date_of_joining
        department
        designation
        location
        reporting_manager
        social_media
        app_version
        device_id
        device_model
        device_type
        os_version
        is_phone
        is_portal
        membership_end_date
        membershiphip_start_date
        membership_type
        user_profile_pic_url
        deactivated_on
        bank_account_id
        bank_ifsc_code
        salary_money
        insurance_expiry_date
        driving_licence_id
        driving_expiry_date
        driving_front_url
        driving_back_url
        government_front_url
        government_back_url
        passport_front_url
        passport_back_url
        presence_settings
        relieving_date
        rfid
        rfid_update_on
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const list_all_locations = /* GraphQL */ `
  query List_all_locations(
    $limit: Int
    $nextToken: String
    $organization_id: String
    $location_status: enumuserstatus
  ) {
    list_all_locations(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      location_status: $location_status
    ) {
      details {
        location_head
        location_created_on
        location_status
        location_id
        organization_id
        location_name
        location_created_by
        geo_lat
        geo_long
        location_type
        is_default
        location_pincode
        location_state
        location_address
        location_country
        location_district
        distributor_id
        territory_id
        is_product_inventory_space
        retailer_id
        qr_details {
          qr_name
          qr_label
          qr_created_by
          is_door_lock
          __typename
        }
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const list_all_departments = /* GraphQL */ `
  query List_all_departments(
    $limit: Int
    $nextToken: String
    $organization_id: String
    $department_status: enumuserstatus
  ) {
    list_all_departments(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      department_status: $department_status
    ) {
      details {
        department_head
        department_created_on
        department_status
        department_id
        organization_id
        department_name
        department_created_by
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const list_all_designation = /* GraphQL */ `
  query List_all_designation(
    $limit: Int
    $nextToken: String
    $organization_id: String
    $designation_status: enumuserstatus
  ) {
    list_all_designation(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      designation_status: $designation_status
    )
  }
`;
export const list_all_forms = /* GraphQL */ `
  query List_all_forms(
    $limit: Int
    $nextToken: String
    $form_type: enumform
    $form_status: enumuserstatus
    $organization_id: String!
  ) {
    list_all_forms(
      limit: $limit
      nextToken: $nextToken
      form_type: $form_type
      form_status: $form_status
      organization_id: $organization_id
    )
  }
`;
export const get_organization_detils = /* GraphQL */ `
  query Get_organization_detils($input: GetOrganizationInput) {
    get_organization_detils(input: $input)
  }
`;
export const list_workflow = /* GraphQL */ `
  query List_workflow(
    $limit: Int
    $nextToken: String
    $organization_id: String
    $user_id: String
  ) {
    list_workflow(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      user_id: $user_id
    )
  }
`;
export const check_organization_team_id = /* GraphQL */ `
  query Check_organization_team_id($organization_team_id: String) {
    check_organization_team_id(organization_team_id: $organization_team_id)
  }
`;
export const get_dashboard_visibilty_details = /* GraphQL */ `
  query Get_dashboard_visibilty_details(
    $organization_id: String!
    $limit: Int
    $nextToken: String
  ) {
    get_dashboard_visibilty_details(
      organization_id: $organization_id
      limit: $limit
      nextToken: $nextToken
    )
  }
`;
export const list_billing_transactions = /* GraphQL */ `
  query List_billing_transactions(
    $limit: Int
    $nextToken: String
    $organization_id: String
    $billing_due: enumdue
  ) {
    list_billing_transactions(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      billing_due: $billing_due
    )
  }
`;
export const list_holidays = /* GraphQL */ `
  query List_holidays(
    $limit: Int
    $nextToken: String
    $organization_id: String
    $holiday_status: enumuserstatus
  ) {
    list_holidays(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      holiday_status: $holiday_status
    )
  }
`;
export const my_team_user_list = /* GraphQL */ `
  query My_team_user_list($input: MyTeamUserListInput) {
    my_team_user_list(input: $input)
  }
`;
export const list_audit_logs = /* GraphQL */ `
  query List_audit_logs(
    $limit: Int
    $nextToken: String
    $organization_id: String!
    $audit_type: enumaudittype
  ) {
    list_audit_logs(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      audit_type: $audit_type
    )
  }
`;
export const list_workflow_roles = /* GraphQL */ `
  query List_workflow_roles(
    $limit: Int
    $nextToken: String
    $organization_id: String!
    $workflow_role_status: enumuserstatus
  ) {
    list_workflow_roles(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      workflow_role_status: $workflow_role_status
    ) {
      details {
        workflow_role_id
        organization_id
        workflow_role_name
        user_id
        user_email_id
        __typename
      }
      Status
      nextToken
      __typename
    }
  }
`;
export const list_master_buckets_regions = /* GraphQL */ `
  query List_master_buckets_regions {
    list_master_buckets_regions
  }
`;
export const list_master_forms = /* GraphQL */ `
  query List_master_forms {
    list_master_forms
  }
`;
export const list_assign_task_or_completed = /* GraphQL */ `
  query List_assign_task_or_completed($input: ListAssignTaskOrCompletedInput) {
    list_assign_task_or_completed(input: $input) {
      details {
        task_id
        organization_id
        task_assign_by
        task_assign_to_name
        task_assign_by_name
        task_assign_to
        task_submitted_on
        attachments_keys
        task_created_on
        task_description
        task_comments {
          commented_by
          commented_by_name
          commented_on
          comment_texts
          __typename
        }
        media_keys
        task_name
        task_completion_date
        task_progress_status
        task_source
        project_name
        project_id
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const list_all_workflow_transactions = /* GraphQL */ `
  query List_all_workflow_transactions(
    $limit: Int
    $nextToken: String
    $organization_id: String
    $approval_status: String
  ) {
    list_all_workflow_transactions(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      approval_status: $approval_status
    ) {
      details {
        report_id
        approval_status
        approval_user_email_id
        initiate_id
        transaction_id
        transaction_on
        workflow_aprroved_on
        workflow_id
        workflow_initiated_by
        workflow_initiated_on
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const list_sumbited_workflows = /* GraphQL */ `
  query List_sumbited_workflows($input: ListSumbitedWorkflowsInput) {
    list_sumbited_workflows(input: $input)
  }
`;
export const list_participants_workflows = /* GraphQL */ `
  query List_participants_workflows($input: ListParticipantsdWorkflowsInput) {
    list_participants_workflows(input: $input)
  }
`;
export const list_pending_workflows = /* GraphQL */ `
  query List_pending_workflows($input: ListPendingWorkflowsInput) {
    list_pending_workflows(input: $input)
  }
`;
export const get_ai_api_settings = /* GraphQL */ `
  query Get_ai_api_settings($input: GetAiApiSettingsInput) {
    get_ai_api_settings(input: $input)
  }
`;
export const list_dashboard_channels = /* GraphQL */ `
  query List_dashboard_channels(
    $limit: Int
    $nextToken: String
    $organization_id: String!
    $dashboard_status: String
    $topic_type: enumtopicstype
    $user_email_id: String
    $app_access: enumappaccess
  ) {
    list_dashboard_channels(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      dashboard_status: $dashboard_status
      topic_type: $topic_type
      user_email_id: $user_email_id
      app_access: $app_access
    ) {
      items {
        dashboard_security
        is_visible
        dashboard_name
        is_editable
        dashboard_unique_type
        team_id
        topic_type
        dashboard_description
        dashboard_password
        dashboard_created_by
        subscribe_counts
        sort_range
        dashboard_type
        dashboard_level
        dashboard_link
        dashboard_created_on
        team_topic_id
        organization_id
        dashboard_status
        team_type
        dashboard_api_key
        is_standard
        dashboard_id
        is_dashboard_admin
        dashboard_publish_type
        dashboard_feed_type
        dashboard_account_details
        app_admins_counts
        app_visible_level
        app_usage_level
        app_access
        user_access
        admin_dashboard_id
        admin_dashboard_name
        admin_dashboard_unique_type
        app_type
        admin_app
        __typename
      }
      data {
        Approvals
        Tasks
        Events
        Team
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const get_dashboard_details = /* GraphQL */ `
  query Get_dashboard_details($dashboard_id: String) {
    get_dashboard_details(dashboard_id: $dashboard_id)
  }
`;
export const get_session_messages = /* GraphQL */ `
  query Get_session_messages($input: GetSessionMessagesInput) {
    get_session_messages(input: $input)
  }
`;
export const get_usage_report_details_openai = /* GraphQL */ `
  query Get_usage_report_details_openai(
    $input: GetUsageReportDetailsOpenaiInput
  ) {
    get_usage_report_details_openai(input: $input)
  }
`;
export const list_events_details = /* GraphQL */ `
  query List_events_details(
    $organization_id: String!
    $event_progress_status: enumeventstatus
    $limit: Int
    $nextToken: String
  ) {
    list_events_details(
      organization_id: $organization_id
      event_progress_status: $event_progress_status
      limit: $limit
      nextToken: $nextToken
    )
  }
`;
export const list_broadcast_messages = /* GraphQL */ `
  query List_broadcast_messages($input: ListBroadcastMessagesInput) {
    list_broadcast_messages(input: $input)
  }
`;
export const list_master_flows_and_forms = /* GraphQL */ `
  query List_master_flows_and_forms($input: ListMasterFlowsAndFormsInput) {
    list_master_flows_and_forms(input: $input)
  }
`;
export const portal_event_list_with_particular_users = /* GraphQL */ `
  query Portal_event_list_with_particular_users(
    $input: PortalEventListWithParticularUsersInput
  ) {
    portal_event_list_with_particular_users(input: $input)
  }
`;
export const event_registers_members_list = /* GraphQL */ `
  query Event_registers_members_list($input: EventRegistersMembersListInput) {
    event_registers_members_list(input: $input) {
      Status
      Message
      nextToken
      data {
        user_id
        registerd_on
        user_email_id
        user_name
        __typename
      }
      __typename
    }
  }
`;
export const all_users_of_organization = /* GraphQL */ `
  query All_users_of_organization($input: AllUsersOfOrganizationInputInput) {
    all_users_of_organization(input: $input)
  }
`;
export const list_broadcast_channels = /* GraphQL */ `
  query List_broadcast_channels($input: listBroadcastChannelsInput) {
    list_broadcast_channels(input: $input) {
      Status
      Message
      data {
        team_name
        team_description
        team_created_by
        is_default
        team_topic_id
        team_id
        no_of_employees_in_team
        team_created_on
        team_action_type
        team_owner_id
        team_visibility
        restricted_users
        __typename
      }
      __typename
    }
  }
`;
export const get_particular_broadcast_details = /* GraphQL */ `
  query Get_particular_broadcast_details(
    $input: GetParticularBroadcastDetailsInput
  ) {
    get_particular_broadcast_details(input: $input)
  }
`;
export const get_particular_task_details = /* GraphQL */ `
  query Get_particular_task_details($input: GetParticularTaskDetailsInput) {
    get_particular_task_details(input: $input)
  }
`;
export const list_membership = /* GraphQL */ `
  query List_membership($input: ListMembershipInput) {
    list_membership(input: $input)
  }
`;
export const get_particular_user_details = /* GraphQL */ `
  query Get_particular_user_details($input: GetParticularUserDetailsInput) {
    get_particular_user_details(input: $input)
  }
`;
export const list_team_list = /* GraphQL */ `
  query List_team_list($input: ListTeamListInput) {
    list_team_list(input: $input)
  }
`;
export const get_team_details = /* GraphQL */ `
  query Get_team_details($input: GetTeamDetailsInput) {
    get_team_details(input: $input)
  }
`;
export const list_expense_category = /* GraphQL */ `
  query List_expense_category($input: ListExpenseCategoryInput) {
    list_expense_category(input: $input)
  }
`;
export const list_initiated_expense = /* GraphQL */ `
  query List_initiated_expense($input: ListInitiatedExpenseInput) {
    list_initiated_expense(input: $input)
  }
`;
export const get_expense_forms = /* GraphQL */ `
  query Get_expense_forms($input: GetExpenseFormsInput) {
    get_expense_forms(input: $input)
  }
`;
export const list_expense_transactions = /* GraphQL */ `
  query List_expense_transactions($input: ListExpenseTransactionsInput) {
    list_expense_transactions(input: $input)
  }
`;
export const list_all_organizations_swipes = /* GraphQL */ `
  query List_all_organizations_swipes($input: ListAllOrganizationsSwipesInput) {
    list_all_organizations_swipes(input: $input) {
      Status
      data {
        datacorrected_comments
        swipe_lat
        swipe_long
        datacorrected_correct_on
        swipe_source
        user_id
        swipe_id
        location_id
        datacorrected_by
        datacorrected_by_name
        swiped_time
        member_id
        user_name
        location_name
        rfid
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const get_early_salary_settings = /* GraphQL */ `
  query Get_early_salary_settings($input: GetEarlySalarySettingsInput) {
    get_early_salary_settings(input: $input)
  }
`;
export const list_forms_customs = /* GraphQL */ `
  query List_forms_customs($input: ListFormsCustomsInput) {
    list_forms_customs(input: $input)
  }
`;
export const add_and_list_appadmins = /* GraphQL */ `
  query Add_and_list_appadmins($input: AddAndListAppadminsInput) {
    add_and_list_appadmins(input: $input)
  }
`;
export const list_dashboard_channels_v2 = /* GraphQL */ `
  query List_dashboard_channels_v2($input: ListDashboardChannelsV2Input) {
    list_dashboard_channels_v2(input: $input)
  }
`;
export const datacorrection_comments_list_edit = /* GraphQL */ `
  query Datacorrection_comments_list_edit(
    $input: DatacorrectionCommentsListEditInput
  ) {
    datacorrection_comments_list_edit(input: $input)
  }
`;
export const daily_present_reports = /* GraphQL */ `
  query Daily_present_reports($input: DailyPresentReportsInput) {
    daily_present_reports(input: $input) {
      Status
      data {
        swipe_date
        user_id
        user_name
        member_id
        first_swipe
        last_swipe
        last_swiped_location
        total_duration
        color_code
        total_swipes
        swipe_list {
          swiped_time
          swipe_source
          swipe_lat
          swipe_long
          location_id
          __typename
        }
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const daily_absent_reports = /* GraphQL */ `
  query Daily_absent_reports($input: DailyAbsentReportsInput) {
    daily_absent_reports(input: $input) {
      Status
      Message
      data {
        user_id
        full_user_name
        member_id
        user_email_id
        __typename
      }
      __typename
    }
  }
`;
export const monthly_reports = /* GraphQL */ `
  query Monthly_reports($input: MonthReportsInput) {
    monthly_reports(input: $input)
  }
`;
export const list_messages = /* GraphQL */ `
  query List_messages($input: ListMessagesInput) {
    list_messages(input: $input)
  }
`;
export const user_early_salary_access = /* GraphQL */ `
  query User_early_salary_access($input: UserEarlySalaryAccessInput) {
    user_early_salary_access(input: $input)
  }
`;
export const list_organization_earlysalary_trans = /* GraphQL */ `
  query List_organization_earlysalary_trans(
    $input: ListOrganizationEarlysalaryTransInput
  ) {
    list_organization_earlysalary_trans(input: $input)
  }
`;
export const user_level_dashboaord_counts = /* GraphQL */ `
  query User_level_dashboaord_counts($input: UserLevelDashboaordCountsInput) {
    user_level_dashboaord_counts(input: $input)
  }
`;
export const leave_reamaining_counts = /* GraphQL */ `
  query Leave_reamaining_counts($input: LeaveReamainingCountsInput) {
    leave_reamaining_counts(input: $input)
  }
`;
export const daily_leave_reports = /* GraphQL */ `
  query Daily_leave_reports($input: DailyLeaveReportsInput) {
    daily_leave_reports(input: $input) {
      Status
      data {
        user_id
        leave_type
        user_name
        leave_duration
        user_email_id
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const list_presence_reports = /* GraphQL */ `
  query List_presence_reports($input: ListPresenceReportsInput) {
    list_presence_reports(input: $input) {
      items {
        user_type
        progressing_status
        report_created_on
        report_generated_by
        report_generated_by_name
        report_type
        generationreport_url
        report_genrated_month
        project_name
        report_genrated_year
        __typename
      }
      __typename
    }
  }
`;
export const list_all_workflow_transactionsv2 = /* GraphQL */ `
  query List_all_workflow_transactionsv2(
    $input: ListAllWorkflowTransactionsv2Input
  ) {
    list_all_workflow_transactionsv2(input: $input)
  }
`;
export const list_all_workflow_transactionsv3 = /* GraphQL */ `
  query List_all_workflow_transactionsv3(
    $input: ListAllWorkflowTransactionsv3Input
  ) {
    list_all_workflow_transactionsv3(input: $input)
  }
`;
export const get_workflow_details = /* GraphQL */ `
  query Get_workflow_details($input: GetWorkflowDetailsInput) {
    get_workflow_details(input: $input)
  }
`;
export const get_product_details = /* GraphQL */ `
  query Get_product_details($input: GetProductDetailsInput) {
    get_product_details(input: $input)
  }
`;
export const list_products = /* GraphQL */ `
  query List_products(
    $limit: Int
    $nextToken: String
    $organization_id: String
    $product_name: String
  ) {
    list_products(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      product_name: $product_name
    )
  }
`;
export const list_categories_products = /* GraphQL */ `
  query List_categories_products($input: ListCategoriesProductsInput) {
    list_categories_products(input: $input)
  }
`;
export const list_products_admins = /* GraphQL */ `
  query List_products_admins($product_id: String) {
    list_products_admins(product_id: $product_id)
  }
`;
export const list_customers = /* GraphQL */ `
  query List_customers($input: listCustomersInput) {
    list_customers(input: $input) {
      items {
        customer_contact_number
        product_id
        customer_name
        customer_email_id
        customer_name_search
        customer_created_by
        customer_address
        customer_created_on
        product_name
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const list_group_chat = /* GraphQL */ `
  query List_group_chat($input: listGroupChatInput) {
    list_group_chat(input: $input)
  }
`;
export const user_team_and_particular_details = /* GraphQL */ `
  query User_team_and_particular_details(
    $input: UserTeamAndParticularDetailsInput
  ) {
    user_team_and_particular_details(input: $input)
  }
`;
export const list_tickets_for_internal_users = /* GraphQL */ `
  query List_tickets_for_internal_users(
    $input: ListTicketsForInternalUsersInput
  ) {
    list_tickets_for_internal_users(input: $input)
  }
`;
export const list_assigns_tickets = /* GraphQL */ `
  query List_assigns_tickets($input: ListAssignsTicketsInput) {
    list_assigns_tickets(input: $input)
  }
`;
export const list_users_for_tickets = /* GraphQL */ `
  query List_users_for_tickets($input: ListUsersForTicketsInput) {
    list_users_for_tickets(input: $input)
  }
`;
export const get_user_ticket_details = /* GraphQL */ `
  query Get_user_ticket_details($input: GetUserTicketDetailsInput) {
    get_user_ticket_details(input: $input)
  }
`;
export const expense_reports_graph = /* GraphQL */ `
  query Expense_reports_graph($input: ExpenseReportsInput) {
    expense_reports_graph(input: $input)
  }
`;
export const ticket_history = /* GraphQL */ `
  query Ticket_history($input: TicketHistoryInput) {
    ticket_history(input: $input)
  }
`;
export const list_assigned_tickets_technicians = /* GraphQL */ `
  query List_assigned_tickets_technicians(
    $input: ListAssignedTicketsTechniciansInput
  ) {
    list_assigned_tickets_technicians(input: $input)
  }
`;
export const list_cusomters_v2 = /* GraphQL */ `
  query List_cusomters_v2($input: ListCusomtersV2Input) {
    list_cusomters_v2(input: $input)
  }
`;
export const list_form_library = /* GraphQL */ `
  query List_form_library($limit: Int, $nextToken: String) {
    list_form_library(limit: $limit, nextToken: $nextToken)
  }
`;
export const get_all_workflows_of_organizations = /* GraphQL */ `
  query Get_all_workflows_of_organizations(
    $input: GetAllWorkflowsOfOrganizationsInput
  ) {
    get_all_workflows_of_organizations(input: $input)
  }
`;
export const list_all_reports = /* GraphQL */ `
  query List_all_reports($input: ListAllReportsInput) {
    list_all_reports(input: $input)
  }
`;
export const list_booking_resource = /* GraphQL */ `
  query List_booking_resource($input: ListBookingResourceInput) {
    list_booking_resource(input: $input)
  }
`;
export const booking_available_for_resource = /* GraphQL */ `
  query Booking_available_for_resource(
    $input: BookingAvailableForResourceInput
  ) {
    booking_available_for_resource(input: $input)
  }
`;
export const my_slot_booking = /* GraphQL */ `
  query My_slot_booking($input: MySlotBookingInput) {
    my_slot_booking(input: $input)
  }
`;
export const Get_holiday_list_portal_v1 = /* GraphQL */ `
  query Get_holiday_list_portal_v1($input: GetHolidayListInput) {
    Get_holiday_list_portal_v1(input: $input)
  }
`;
export const list_all_expense_group = /* GraphQL */ `
  query List_all_expense_group(
    $limit: Int
    $nextToken: String
    $organization_id: String
    $expense_group_status: enumuserstatus
  ) {
    list_all_expense_group(
      limit: $limit
      nextToken: $nextToken
      organization_id: $organization_id
      expense_group_status: $expense_group_status
    ) {
      details {
        expense_group_head
        expense_group_created_on
        expense_group_status
        expense_group_id
        organization_id
        expense_group_name
        expense_group_created_by
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const get_activities = /* GraphQL */ `
  query Get_activities($input: GetActivitiesInput) {
    get_activities(input: $input)
  }
`;
export const get_projects = /* GraphQL */ `
  query Get_projects($input: GetProjectsInput) {
    get_projects(input: $input)
  }
`;
export const list_all_audit_logs = /* GraphQL */ `
  query List_all_audit_logs($input: ListAllAuditLogsInput) {
    list_all_audit_logs(input: $input)
  }
`;
export const get_particular_workflow_details = /* GraphQL */ `
  query Get_particular_workflow_details($input: GetWorkflowDetailsInputs) {
    get_particular_workflow_details(input: $input)
  }
`;
export const list_sumbited_workflows_v1 = /* GraphQL */ `
  query List_sumbited_workflows_v1($input: ListSumbitedWorkflowsInput) {
    list_sumbited_workflows_v1(input: $input)
  }
`;
export const list_participants_workflows_v1 = /* GraphQL */ `
  query List_participants_workflows_v1(
    $input: ListParticipantsdWorkflowsInput
  ) {
    list_participants_workflows_v1(input: $input)
  }
`;
export const list_pending_workflows_v1 = /* GraphQL */ `
  query List_pending_workflows_v1($input: ListPendingWorkflowsInput) {
    list_pending_workflows_v1(input: $input)
  }
`;
export const list_dashboard_users = /* GraphQL */ `
  query List_dashboard_users($input: ListDashboardUsersInput) {
    list_dashboard_users(input: $input)
  }
`;
export const get_all_workflows_of_organizations_v1 = /* GraphQL */ `
  query Get_all_workflows_of_organizations_v1(
    $input: GetAllWorkflowsOfOrganizationsInput
  ) {
    get_all_workflows_of_organizations_v1(input: $input)
  }
`;
export const list_workflow_names = /* GraphQL */ `
  query List_workflow_names($input: ListWorkflowNamesInput) {
    list_workflow_names(input: $input)
  }
`;
export const list_timesheet = /* GraphQL */ `
  query List_timesheet($input: ListTimesheetDataInput) {
    list_timesheet(input: $input)
  }
`;
export const get_total_work_duartion = /* GraphQL */ `
  query Get_total_work_duartion($input: GetTotatlWorkedDurationInput) {
    get_total_work_duartion(input: $input)
  }
`;
export const daily_leave_reports_v1 = /* GraphQL */ `
  query Daily_leave_reports_v1($input: DailyLeaveReportsInput) {
    daily_leave_reports_v1(input: $input) {
      Status
      data {
        user_id
        leave_type
        user_name
        leave_duration
        user_email_id
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const list_timesheet_reports = /* GraphQL */ `
  query List_timesheet_reports($input: ListTimesheetReportsInput) {
    list_timesheet_reports(input: $input) {
      items {
        user_type
        progressing_status
        report_created_on
        report_generated_by
        report_generated_by_name
        report_type
        generationreport_url
        report_genrated_month
        project_name
        report_genrated_year
        __typename
      }
      __typename
    }
  }
`;
export const get_payslip_headers = /* GraphQL */ `
  query Get_payslip_headers($input: GetPayslipHeadersInput) {
    get_payslip_headers(input: $input)
  }
`;
export const get_payslip_template = /* GraphQL */ `
  query Get_payslip_template($input: GetPayslipHeadersInput) {
    get_payslip_template(input: $input)
  }
`;
export const get_payslips = /* GraphQL */ `
  query Get_payslips($input: GetPayslipsInput) {
    get_payslips(input: $input)
  }
`;
export const get_user_payslips = /* GraphQL */ `
  query Get_user_payslips($input: GetUserPayslipInput) {
    get_user_payslips(input: $input)
  }
`;
export const get_user_payslip_html = /* GraphQL */ `
  query Get_user_payslip_html($input: GetPayslipsHtmlInput) {
    get_user_payslip_html(input: $input)
  }
`;
export const list_Directory_forms = /* GraphQL */ `
  query List_Directory_forms($input: DirectoryAdminListInput) {
    list_Directory_forms(input: $input)
  }
`;
export const list_Directory_entries_portal = /* GraphQL */ `
  query List_Directory_entries_portal($input: DirectoryEntriesListInput) {
    list_Directory_entries_portal(input: $input)
  }
`;
export const list_user_sub_directories = /* GraphQL */ `
  query List_user_sub_directories($input: DirectoryListSubEntryInput) {
    list_user_sub_directories(input: $input)
  }
`;
export const list_directory_users = /* GraphQL */ `
  query List_directory_users($input: DirectoryListDirectoryUsersInput) {
    list_directory_users(input: $input)
  }
`;
export const get_particular_directory = /* GraphQL */ `
  query Get_particular_directory($input: DirectoryByIdInput) {
    get_particular_directory(input: $input)
  }
`;
export const get_dirDetails_for_webhook = /* GraphQL */ `
  query Get_dirDetails_for_webhook($input: DirectoryParamsInput) {
    get_dirDetails_for_webhook(input: $input)
  }
`;
export const list_user_assets = /* GraphQL */ `
  query List_user_assets($input: ListUserAssetsInput) {
    list_user_assets(input: $input)
  }
`;
export const list_all_assets = /* GraphQL */ `
  query List_all_assets($input: ListAllAssetsInput) {
    list_all_assets(input: $input)
  }
`;
export const list_workflow_details = /* GraphQL */ `
  query List_workflow_details($input: ListWorkflowDetailsInput) {
    list_workflow_details(input: $input)
  }
`;
export const generate_directory_excel_report = /* GraphQL */ `
  query Generate_directory_excel_report($input: DirectoryExcelGenerateInput) {
    generate_directory_excel_report(input: $input)
  }
`;
export const list_cabinet_root_folders = /* GraphQL */ `
  query List_cabinet_root_folders($input: ListCabinetFoldersInputs) {
    list_cabinet_root_folders(input: $input)
  }
`;
export const get_s3_files_download = /* GraphQL */ `
  query Get_s3_files_download($input: GetS3FilesInputs) {
    get_s3_files_download(input: $input)
  }
`;
export const get_s3_existing_files = /* GraphQL */ `
  query Get_s3_existing_files($input: GetS3ExistingFilesInputs) {
    get_s3_existing_files(input: $input)
  }
`;
export const list_product_category_names = /* GraphQL */ `
  query List_product_category_names($input: ListProductsCategoryInputs) {
    list_product_category_names(input: $input)
  }
`;
export const list_all_stichh_channels = /* GraphQL */ `
  query List_all_stichh_channels($input: ListAllChannelsInput) {
    list_all_stichh_channels(input: $input)
  }
`;
export const list_ticket_mangement_reports = /* GraphQL */ `
  query List_ticket_mangement_reports($input: ListTicketMangementInputs) {
    list_ticket_mangement_reports(input: $input)
  }
`;
export const list_all_dashboards = /* GraphQL */ `
  query List_all_dashboards($input: ListAllDashboardsInputs) {
    list_all_dashboards(input: $input)
  }
`;
export const get_particular_dashboard = /* GraphQL */ `
  query Get_particular_dashboard($input: GetParticularDashboardInputs) {
    get_particular_dashboard(input: $input)
  }
`;
export const get_particular_channel = /* GraphQL */ `
  query Get_particular_channel($input: ListParticularChannelsInput) {
    get_particular_channel(input: $input)
  }
`;
export const get_presence_dashboard = /* GraphQL */ `
  query Get_presence_dashboard($input: GetPresenceDashboardInputs) {
    get_presence_dashboard(input: $input)
  }
`;
export const list_all_swipes = /* GraphQL */ `
  query List_all_swipes($input: ListAllSwipesInputs) {
    list_all_swipes(input: $input)
  }
`;
export const get_current_user_web_portal = /* GraphQL */ `
  query Get_current_user_web_portal {
    get_current_user_web_portal
  }
`;
export const get_presigned_url_to_upload_files = /* GraphQL */ `
  query Get_presigned_url_to_upload_files(
    $input: GetPresignedUrlToUploadFilesInputs
  ) {
    get_presigned_url_to_upload_files(input: $input)
  }
`;
export const list_all_tv_boards = /* GraphQL */ `
  query List_all_tv_boards($input: ListALLTvBoardInputs) {
    list_all_tv_boards(input: $input)
  }
`;
export const get_tvboard_details = /* GraphQL */ `
  query Get_tvboard_details($input: GetTvBoardDetailsInputs) {
    get_tvboard_details(input: $input)
  }
`;
export const get_all_organizations_asset_locations = /* GraphQL */ `
  query Get_all_organizations_asset_locations {
    get_all_organizations_asset_locations
  }
`;
export const asset_dashboard_reports = /* GraphQL */ `
  query Asset_dashboard_reports($input: AssetDashboardReportsInputs) {
    asset_dashboard_reports(input: $input)
  }
`;
export const get_verified_unverified_assets = /* GraphQL */ `
  query Get_verified_unverified_assets(
    $input: GetVerifiedUnverifiedAssetsInputs
  ) {
    get_verified_unverified_assets(input: $input)
  }
`;
export const get_workflow_aging_records = /* GraphQL */ `
  query Get_workflow_aging_records($input: GetWorkflowAgingRecordsInputs) {
    get_workflow_aging_records(input: $input)
  }
`;
export const get_asset_workflow_details = /* GraphQL */ `
  query Get_asset_workflow_details($input: GetAssetWorkflowDetailsInputs) {
    get_asset_workflow_details(input: $input)
  }
`;
export const list_all_requested_assets = /* GraphQL */ `
  query List_all_requested_assets($input: ListAllRequestedAssetsInputs) {
    list_all_requested_assets(input: $input)
  }
`;
export const list_knockedoff_aging_workflow = /* GraphQL */ `
  query List_knockedoff_aging_workflow($input: ListAgingKnockoffInputs) {
    list_knockedoff_aging_workflow(input: $input)
  }
`;
export const list_territories = /* GraphQL */ `
  query List_territories {
    list_territories
  }
`;
export const list_visittypes = /* GraphQL */ `
  query List_visittypes {
    list_visittypes
  }
`;
export const get_visit_type_form = /* GraphQL */ `
  query Get_visit_type_form($input: GetVisitTypeFormInputs) {
    get_visit_type_form(input: $input)
  }
`;
export const list_all_visit_locations = /* GraphQL */ `
  query List_all_visit_locations($input: ListALLVisitLocatonsInputs) {
    list_all_visit_locations(input: $input)
  }
`;
export const list_all_visit_reps = /* GraphQL */ `
  query List_all_visit_reps {
    list_all_visit_reps
  }
`;
export const get_user_visits_details = /* GraphQL */ `
  query Get_user_visits_details {
    get_user_visits_details
  }
`;
export const list_all_user_visit_logs = /* GraphQL */ `
  query List_all_user_visit_logs($input: ListUserVisitLogInputs) {
    list_all_user_visit_logs(input: $input)
  }
`;
export const list_My_dashboards = /* GraphQL */ `
  query List_My_dashboards($input: ListMyDashboardsInputs) {
    list_My_dashboards(input: $input)
  }
`;
export const list_all_project_site_users = /* GraphQL */ `
  query List_all_project_site_users {
    list_all_project_site_users
  }
`;
export const asset_management_reports = /* GraphQL */ `
  query Asset_management_reports($input: AssetManagementReportsInputs) {
    asset_management_reports(input: $input)
  }
`;
export const List_Material_Stock = /* GraphQL */ `
  query List_Material_Stock($input: ListMaterialStockInputs) {
    List_Material_Stock(input: $input)
  }
`;
export const get_visit_workflows = /* GraphQL */ `
  query Get_visit_workflows($input: GetVisitWorkflowInputs) {
    get_visit_workflows(input: $input)
  }
`;
export const Material_Dispatch_Consumption_Logs = /* GraphQL */ `
  query Material_Dispatch_Consumption_Logs(
    $input: MaterialDispatchConsumptionInputs
  ) {
    Material_Dispatch_Consumption_Logs(input: $input)
  }
`;
export const get_visits_dashboard_data = /* GraphQL */ `
  query Get_visits_dashboard_data {
    get_visits_dashboard_data
  }
`;
export const List_Material_Stock_Transactions = /* GraphQL */ `
  query List_Material_Stock_Transactions(
    $input: ListMaterialStockTransactionsInputs
  ) {
    List_Material_Stock_Transactions(input: $input)
  }
`;
export const genrate_visit_management_reports = /* GraphQL */ `
  query Genrate_visit_management_reports($input: VisitManagementReportsInputs) {
    genrate_visit_management_reports(input: $input)
  }
`;
export const List_Location_Wise_Materials = /* GraphQL */ `
  query List_Location_Wise_Materials($input: ListLocationWiseMaterialsInputs) {
    List_Location_Wise_Materials(input: $input)
  }
`;
export const ListProjectSites = /* GraphQL */ `
  query ListProjectSites {
    ListProjectSites
  }
`;
export const List_material_with_locations = /* GraphQL */ `
  query List_material_with_locations {
    List_material_with_locations
  }
`;
export const list_all_user_projects = /* GraphQL */ `
  query List_all_user_projects($input: ListAllUserProjectsInputs) {
    list_all_user_projects(input: $input)
  }
`;
export const list_all_purchase_orders = /* GraphQL */ `
  query List_all_purchase_orders($input: ListAllPurchaseOrdersInputs) {
    list_all_purchase_orders(input: $input)
  }
`;
export const list_all_project_reports = /* GraphQL */ `
  query List_all_project_reports($input: ListAllProjectReportsInputs) {
    list_all_project_reports(input: $input)
  }
`;
export const get_org_dashboard_data = /* GraphQL */ `
  query Get_org_dashboard_data {
    get_org_dashboard_data
  }
`;
export const get_all_apps_list = /* GraphQL */ `
  query Get_all_apps_list {
    get_all_apps_list
  }
`;
export const list_all_cargo_spaces = /* GraphQL */ `
  query List_all_cargo_spaces {
    list_all_cargo_spaces
  }
`;
export const list_all_cargo_items = /* GraphQL */ `
  query List_all_cargo_items {
    list_all_cargo_items
  }
`;
export const list_user_app_subscribers = /* GraphQL */ `
  query List_user_app_subscribers($input: ListUserAppSubscribersInputs) {
    list_user_app_subscribers(input: $input)
  }
`;
export const genrate_billing_invoice = /* GraphQL */ `
  query Genrate_billing_invoice($input: GenrateBillingInvoiceInputs) {
    genrate_billing_invoice(input: $input)
  }
`;
export const lit_org_guest_houses = /* GraphQL */ `
  query Lit_org_guest_houses($input: listOrgGuestHousesInputs) {
    lit_org_guest_houses(input: $input)
  }
`;
export const list_Customer_Transaction = /* GraphQL */ `
  query List_Customer_Transaction($input: listCustomerTransactionInputs) {
    list_Customer_Transaction(input: $input)
  }
`;
export const list_All_Customers = /* GraphQL */ `
  query List_All_Customers($input: listAllCustomersInputs) {
    list_All_Customers(input: $input)
  }
`;
export const list_transactions_of_invoice = /* GraphQL */ `
  query List_transactions_of_invoice($input: ListTransactionsOfInvoiceInputs) {
    list_transactions_of_invoice(input: $input)
  }
`;
export const list_email_logs = /* GraphQL */ `
  query List_email_logs {
    list_email_logs
  }
`;
export const list_all_users = /* GraphQL */ `
  query List_all_users($input: ListAllUsersInputs) {
    list_all_users(input: $input)
  }
`;
export const list_supplier_transaction = /* GraphQL */ `
  query List_supplier_transaction($input: listsupplierTransactionInputs) {
    list_supplier_transaction(input: $input)
  }
`;
export const list_all_suppliers = /* GraphQL */ `
  query List_all_suppliers($input: listAllSuppliersInputs) {
    list_all_suppliers(input: $input)
  }
`;
export const genrate_expense_reports_postgrace = /* GraphQL */ `
  query Genrate_expense_reports_postgrace(
    $input: GenrateExpenseReportsPostgraceInputs
  ) {
    genrate_expense_reports_postgrace(input: $input)
  }
`;
export const get_vendor_workflows = /* GraphQL */ `
  query Get_vendor_workflows {
    get_vendor_workflows
  }
`;
export const list_vendor_transactions = /* GraphQL */ `
  query List_vendor_transactions($input: listVendorTransactionsInputs) {
    list_vendor_transactions(input: $input)
  }
`;
export const get_vendor_reports_graph = /* GraphQL */ `
  query Get_vendor_reports_graph($input: getVendorReportsGraphInputs) {
    get_vendor_reports_graph(input: $input)
  }
`;
export const generate_vendor_reports = /* GraphQL */ `
  query Generate_vendor_reports($input: genrateVendorReportsInputs) {
    generate_vendor_reports(input: $input)
  }
`;
export const get_particular_project = /* GraphQL */ `
  query Get_particular_project($input: getParticularProjectInputs) {
    get_particular_project(input: $input)
  }
`;
export const list_assigned_tasks = /* GraphQL */ `
  query List_assigned_tasks($input: listAssignedTaskInputs) {
    list_assigned_tasks(input: $input)
  }
`;
export const List_product_stock = /* GraphQL */ `
  query List_product_stock($input: ListProductStockInputs) {
    List_product_stock(input: $input)
  }
`;
export const product_Consumption_Logs = /* GraphQL */ `
  query Product_Consumption_Logs($input: productConsumptionLogsInputs) {
    product_Consumption_Logs(input: $input)
  }
`;
export const ListMasterDirectories = /* GraphQL */ `
  query ListMasterDirectories {
    ListMasterDirectories
  }
`;
export const ListS3DirectoryEntries = /* GraphQL */ `
  query ListS3DirectoryEntries($input: ListS3DirectoryEntriesInputs) {
    ListS3DirectoryEntries(input: $input)
  }
`;
export const list_orders = /* GraphQL */ `
  query List_orders($input: listOrdersInputs) {
    list_orders(input: $input)
  }
`;
export const prezence_daily_reports = /* GraphQL */ `
  query Prezence_daily_reports($input: presenceDailyReportsInputs) {
    prezence_daily_reports(input: $input)
  }
`;
export const list_rfid_mapped_locations = /* GraphQL */ `
  query List_rfid_mapped_locations {
    list_rfid_mapped_locations
  }
`;
export const list_presence_visitors = /* GraphQL */ `
  query List_presence_visitors {
    list_presence_visitors
  }
`;
export const list_presence_visitor_logs = /* GraphQL */ `
  query List_presence_visitor_logs {
    list_presence_visitor_logs
  }
`;
export const export_customer_data = /* GraphQL */ `
  query Export_customer_data($input: exportCustomerDataInput) {
    export_customer_data(input: $input)
  }
`;
export const export_vendor_data = /* GraphQL */ `
  query Export_vendor_data($input: exportVendorDataInput) {
    export_vendor_data(input: $input)
  }
`;
export const genrate_project_cost_graph = /* GraphQL */ `
  query Genrate_project_cost_graph($input: genarateProjectCostGraphInputs) {
    genrate_project_cost_graph(input: $input)
  }
`;
export const list_master_checklist = /* GraphQL */ `
  query List_master_checklist {
    list_master_checklist
  }
`;
export const list_admin_checklists = /* GraphQL */ `
  query List_admin_checklists($input: listChecklistsInputs) {
    list_admin_checklists(input: $input)
  }
`;
export const list_user_checklists = /* GraphQL */ `
  query List_user_checklists($input: listUserChecklistsInputs) {
    list_user_checklists(input: $input)
  }
`;
export const yearly_admin_reports = /* GraphQL */ `
  query Yearly_admin_reports($input: yearlyAdminReportsInputs) {
    yearly_admin_reports(input: $input)
  }
`;
export const get_particular_checklist = /* GraphQL */ `
  query Get_particular_checklist($input: getParticularChecklistInputs) {
    get_particular_checklist(input: $input)
  }
`;
export const list_user_pettycash_transactions = /* GraphQL */ `
  query List_user_pettycash_transactions {
    list_user_pettycash_transactions
  }
`;
export const list_petty_cash_workflows = /* GraphQL */ `
  query List_petty_cash_workflows($input: listPettyCashWorkflowInputs) {
    list_petty_cash_workflows(input: $input)
  }
`;
export const get_leaderboard_admin = /* GraphQL */ `
  query Get_leaderboard_admin {
    get_leaderboard_admin
  }
`;
export const get_awards_workflows = /* GraphQL */ `
  query Get_awards_workflows($input: getAwardsWorkflowsInputs) {
    get_awards_workflows(input: $input)
  }
`;
export const genrate_project_reports = /* GraphQL */ `
  query Genrate_project_reports($input: genrateProjectReportsInputs) {
    genrate_project_reports(input: $input)
  }
`;
export const list_partners = /* GraphQL */ `
  query List_partners {
    list_partners
  }
`;
export const get_member_id = /* GraphQL */ `
  query Get_member_id($organization_id: String!) {
    get_member_id(organization_id: $organization_id)
  }
`;
export const list_organization_sale_purchase_config = /* GraphQL */ `
  query List_organization_sale_purchase_config {
    list_organization_sale_purchase_config
  }
`;
export const list_items = /* GraphQL */ `
  query List_items {
    list_items
  }
`;
export const get_items_transactions = /* GraphQL */ `
  query Get_items_transactions($input: getItemsTransactionsInputs) {
    get_items_transactions(input: $input)
  }
`;
export const get_units_items = /* GraphQL */ `
  query Get_units_items($input: getUnitItemsInputs) {
    get_units_items(input: $input)
  }
`;
export const get_category_items = /* GraphQL */ `
  query Get_category_items($input: getCategoryItemsInputs) {
    get_category_items(input: $input)
  }
`;
export const get_organization_prefix = /* GraphQL */ `
  query Get_organization_prefix(
    $organization_id: String!
    $prefix_type: enumorgprifix!
  ) {
    get_organization_prefix(
      organization_id: $organization_id
      prefix_type: $prefix_type
    )
  }
`;
export const list_sale_order_quotations = /* GraphQL */ `
  query List_sale_order_quotations($input: listSaleOrderQuotationsInputs) {
    list_sale_order_quotations(input: $input)
  }
`;
export const list_all_apps = /* GraphQL */ `
  query List_all_apps {
    list_all_apps {
      Status
      data {
        dashboard_unique_type
        dashboard_description
        organization_id
        user_access
        app_access
        dashboard_name
        dashboard_id
        subscribe_counts
        is_visible
        app_usage_level
        app_abbreviation
        admin_dashboard_id
        admin_dashboard_name
        admin_dashboard_unique_type
        admin_is_visible
        admin_app
        app_admins_counts
        app_type
        user_restricted_app
        __typename
      }
      __typename
    }
  }
`;
export const get_customer_transactions = /* GraphQL */ `
  query Get_customer_transactions(
    $customer_id: String!
    $organization_id: String!
    $nextToken: String
    $limit: Int
  ) {
    get_customer_transactions(
      customer_id: $customer_id
      organization_id: $organization_id
      nextToken: $nextToken
      limit: $limit
    )
  }
`;
export const list_all_projects = /* GraphQL */ `
  query List_all_projects($organization_id: String!) {
    list_all_projects(organization_id: $organization_id)
  }
`;
export const list_all_payment_transactions = /* GraphQL */ `
  query List_all_payment_transactions(
    $input: listAllPaymentTransactionsInputs
  ) {
    list_all_payment_transactions(input: $input)
  }
`;
export const get_hsn_data = /* GraphQL */ `
  query Get_hsn_data {
    get_hsn_data
  }
`;
export const get_team_awards_workflows = /* GraphQL */ `
  query Get_team_awards_workflows($input: getAwardsWorkflowsInputs) {
    get_team_awards_workflows(input: $input)
  }
`;
export const list_purchase_order_transactions = /* GraphQL */ `
  query List_purchase_order_transactions($input: listPurchaseOrderInputs) {
    list_purchase_order_transactions(input: $input)
  }
`;
export const list_my_leaves = /* GraphQL */ `
  query List_my_leaves {
    list_my_leaves
  }
`;
export const get_supplier_transactions = /* GraphQL */ `
  query Get_supplier_transactions($input: getSupplierTransactionInputs) {
    get_supplier_transactions(input: $input)
  }
`;
export const list_all_reward_projects = /* GraphQL */ `
  query List_all_reward_projects($organization_id: String!) {
    list_all_reward_projects(organization_id: $organization_id)
  }
`;
export const list_crm_leads = /* GraphQL */ `
  query List_crm_leads {
    list_crm_leads
  }
`;
export const list_pipeline_stages = /* GraphQL */ `
  query List_pipeline_stages {
    list_pipeline_stages
  }
`;
export const get_ticket_by_id = /* GraphQL */ `
  query Get_ticket_by_id($input: GetTicketInput) {
    get_ticket_by_id(input: $input)
  }
`;
export const list_my_tickets = /* GraphQL */ `
  query List_my_tickets($input: ListMyTicketsInput) {
    list_my_tickets(input: $input)
  }
`;
export const list_externalpool_tickets = /* GraphQL */ `
  query List_externalpool_tickets($input: ListExternalPoolTicketsInput) {
    list_externalpool_tickets(input: $input)
  }
`;
export const get_admin_tickets_report = /* GraphQL */ `
  query Get_admin_tickets_report($input: AdminTicketsReportInput!) {
    get_admin_tickets_report(input: $input)
  }
`;
export const list_all_tickets = /* GraphQL */ `
  query List_all_tickets($input: listAllTicketstInput!) {
    list_all_tickets(input: $input)
  }
`;
export const get_details_for_api_display = /* GraphQL */ `
  query Get_details_for_api_display {
    get_details_for_api_display
  }
`;
export const list_admin_workflows = /* GraphQL */ `
  query List_admin_workflows($limit: Int, $nextToken: String) {
    list_admin_workflows(limit: $limit, nextToken: $nextToken)
  }
`;
export const list_daily_attendence_report_configuration = /* GraphQL */ `
  query List_daily_attendence_report_configuration {
    list_daily_attendence_report_configuration
  }
`;
export const list_monthly_attendence_report_configuration = /* GraphQL */ `
  query List_monthly_attendence_report_configuration {
    list_monthly_attendence_report_configuration
  }
`;
export const list_lead_deadlines = /* GraphQL */ `
  query List_lead_deadlines {
    list_lead_deadlines
  }
`;
export const list_games = /* GraphQL */ `
  query List_games {
    list_games
  }
`;
export const get_game_details = /* GraphQL */ `
  query Get_game_details($input: getGameDetailsInput) {
    get_game_details(input: $input)
  }
`;
export const veiw_past_games = /* GraphQL */ `
  query Veiw_past_games {
    veiw_past_games
  }
`;
export const get_leaderboard = /* GraphQL */ `
  query Get_leaderboard($input: GetLeaderboardInput) {
    get_leaderboard(input: $input)
  }
`;
export const get_apps_enabled_status = /* GraphQL */ `
  query Get_apps_enabled_status {
    get_apps_enabled_status
  }
`;
export const get_inventory_stock = /* GraphQL */ `
  query Get_inventory_stock($input: GetInventoryStockInput) {
    get_inventory_stock(input: $input)
  }
`;
export const get_inventory_consumption_logs = /* GraphQL */ `
  query Get_inventory_consumption_logs(
    $input: GetInventoryConsumptionLogsInput
  ) {
    get_inventory_consumption_logs(input: $input)
  }
`;
export const list_all_org_projects = /* GraphQL */ `
  query List_all_org_projects($input: ListAllOrgProjectsInput) {
    list_all_org_projects(input: $input)
  }
`;
export const get_project_notification_settings = /* GraphQL */ `
  query Get_project_notification_settings(
    $input: getProjectNotificationSettingsInput
  ) {
    get_project_notification_settings(input: $input)
  }
`;
export const get_worktypes = /* GraphQL */ `
  query Get_worktypes($input: GetWorktypesInput) {
    get_worktypes(input: $input)
  }
`;
export const list_worktype_forms = /* GraphQL */ `
  query List_worktype_forms($input: listWorktypeFormsInput) {
    list_worktype_forms(input: $input)
  }
`;
