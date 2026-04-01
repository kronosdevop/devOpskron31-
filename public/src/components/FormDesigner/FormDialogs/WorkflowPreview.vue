<template>
  <div>
    <v-card flat class="mt-2">
      <v-card-text>
        <v-row class="mt-3" no-gutters>
          <!-- <div>Form Name :{{ formInfo.form_name }}</div> -->
          <v-spacer />
          <v-btn size="small" @click="back_option()" class="text-white cardCss"
            >Back</v-btn
          >

          <v-btn
            size="small"
            @click="next_option()"
            class="ml-2 text-white cardCss"
            :disabled="formpublishCheck == true"
            :loading="loading"
            >Publish</v-btn
          >
        </v-row>
        <v-row>
          <v-col cols="6">
            <div>
              <span
                ><label class="font-weight-bold">Form Name :</label
                >{{ params.publishInfo.workflow_name }}</span
              >
            </div>
            <div class="pt-2">
              <span
                ><label class="font-weight-bold">Form Description :</label
                >{{ params.publishInfo.workflow_description }}</span
              >
            </div>
            <div class="pt-2">
              <span
                ><label class="font-weight-bold">Summary 1 :</label
                >{{ params.publishInfo.summary_field_1 }}</span
              >
            </div>
            <div class="pt-2">
              <span
                ><label class="font-weight-bold">Summary 2 :</label
                >{{ params.publishInfo.summary_field_2 }}</span
              >
            </div>
            <div
              class="pt-2"
              v-if="params.publishInfo.workflow_design_type == 'DEFAULT'"
            >
              <span
                ><label class="font-weight-bold">Visibility :</label
                >{{
                  params.publishInfo.workflow_visibility.visible_type ==
                  "ALL_MEMBERS"
                    ? "All Members"
                    : "Groups"
                }}</span
              >
            </div>
            <div
              class="pt-2"
              v-if="
                params.publishInfo.workflow_visibility.visible_type == 'GROUPS'
              "
            >
              <span
                ><label class="font-weight-bold">Groups :</label
                >{{
                  params.publishInfo.workflow_visibility.visible_groups
                    .length != 0
                    ? params.publishInfo.workflow_visibility.visible_groups
                        .map((email) => fetch_user_group(email))
                        .join(", ")
                    : " -"
                }}</span
              >
            </div>
            <div
              class="pt-2"
              v-if="params.publishInfo.workflow_design_type == 'DEFAULT'"
            >
              <span
                ><label class="font-weight-bold">Notification :</label
                >{{
                  params.publishInfo.notifications.length != 0
                    ? params.publishInfo.notifications
                        .map((email) => fetch_user_Name(email))
                        .join(", ")
                    : " -"
                }}</span
              >
            </div>
            <div
              class="pt-2"
              v-if="params.publishInfo.workflow_design_type == 'DEFAULT'"
            >
              <span
                ><label class="font-weight-bold"
                  >Group Head will be notified by email and by app notification
                  :</label
                >{{
                  params.publishInfo.is_group_noftication_enabled == true
                    ? "Yes"
                    : "No"
                }}</span
              >
            </div>
            <div class="pt-2">
              <span
                ><label class="font-weight-bold">Webhook/Other Settings :</label
                >Invoke Url :
                {{ JSON.parse(params.publishInfo.workflow_webhook).invoke_url }}
                , Authorization :
                {{
                  JSON.parse(params.publishInfo.workflow_webhook).authorization
                }}</span
              >
            </div>
          </v-col>
          <v-col cols="6">
            <div>
              <span
                ><label class="font-weight-bold">Form Type :</label>
                {{
                  handleformType(params.publishInfo.workflow_design_type)
                }}</span
              >
            </div>
            <div class="pt-2">
              <span
                ><label class="font-weight-bold">Work Flow Steps :</label>
                <div v-if="userList.length > 0">
                  <ul>
                    <!-- Loop through userList and display user_type and user_id -->
                    <li v-for="(user, index) in userList" :key="index">
                      <span v-if="user.user_type == 'team_member'">
                        Team Member ({{ fetch_userName(user.user_id) }})</span
                      >
                      <span v-else>{{ handleClick(user.user_type) }}</span>
                    </li>
                  </ul>
                </div>
                <span v-else> N/A</span>
              </span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { create_worklow } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_department_details } from "@/mixins/GetDepartments.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  mixins: [get_department_details, get_all_org_users],
  data() {
    return {
      userList: [],
      loading: false,
      formpublishCheck: false,
    };
  },
  async created() {
    this.formpublishCheck = true;
    await Promise.all([
      this.get_all_org_users(),
      this.get_department_details(),
    ]);
    this.formpublishCheck = false;
    this.userList = this.extractUserTypeAndId(
      this.params.publishInfo.workflow_approval_steps
    );

    // console.log(this.params.publishInfo);
  },
  methods: {
    async next_option() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(create_worklow, {
            input: this.params.publishInfo,
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.create_worklow);
        if (response.Status == "SUCCESS") {
          this.$emit("completion", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        // console.log(error,'error')
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
        // this.loading = false;
      }
    },
    handleformType(val) {
      switch (val) {
        case "DEFAULT":
          return "Normal Flow";

        case "EXTERNAL_API":
          return "External API";

        case "EXTERNAL_FORM":
          return "External Form";

        default:
          return val;
      }
    },
    handleClick(val) {
      switch (val) {
        case "group_head":
          return "Group Head";

        case "initiator":
          return "Initiator";

        case "initiator_reporting_manager":
          return "Initiator Reporting Manger";

        default:
          return val;
      }
    },
    fetch_userName(value) {
      let name = "";
      this.orgUsers.forEach((element) => {
        if (element.user_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },
    fetch_user_Name(value) {
      let name = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },
    fetch_user_group(value) {
      let name = "";
      this.departmentList.forEach((element) => {
        if (element.department_id == value) {
          name = element.department_name;
        }
      });
      return name;
    },
    back_option() {
      this.$emit("backstepPreview", 0);
    },
    extractUserTypeAndId(jsonString) {
      // Parse the JSON string
      const parsedData = JSON.parse(jsonString);

      // Extract and return an array with `user_type` and `user_id`
      return parsedData.map((item) => ({
        user_type: item.user_type,
        user_id: item.user_id,
      }));
    },
  },
};
</script>

<style>
</style>