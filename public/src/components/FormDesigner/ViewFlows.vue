<template>
  <div>
    <!-- eslint-disable 
 -->
    <v-dialog :model-value="viewForm" @update:model-value="$emit('update:viewForm', $event)"
      persistent
      transition="dialog-top-transition"
      width="800px"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="custom-title ml-2">
            {{ ViewInfo.workflow_name }}
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="pa-5">
          <v-row>
            <v-col cols="6">
              <div>
                <span
                  ><label class="font-weight-bold">Form Name :</label>
                  {{ ViewInfo.workflow_name }}</span
                >
              </div>
              <div class="pt-2">
                <span
                  ><label class="font-weight-bold">Form Description :</label>
                  {{ ViewInfo.workflow_description }}</span
                >
              </div>
              <div class="pt-2">
                <span
                  ><label class="font-weight-bold">Summary 1 :</label>
                  {{ ViewInfo.summary_field_1 }}</span
                >
              </div>
              <div class="pt-2">
                <span
                  ><label class="font-weight-bold">Summary 2 :</label>
                  {{ ViewInfo.summary_field_2 }}</span
                >
              </div>
              <div
                class="pt-2"
                v-if="ViewInfo.workflow_design_type == 'DEFAULT'"
              >
                <span
                  ><label class="font-weight-bold">Visibility :</label>
                  {{
                    ViewInfo.workflow_visibility.visible_type == "ALL_MEMBERS"
                      ? "All Members"
                      : "Groups"
                  }}</span
                >
              </div>
              <div
                class="pt-2"
                v-if="ViewInfo.workflow_visibility.visible_type == 'GROUPS'"
              >
                <span
                  ><label class="font-weight-bold">Groups :</label>
                  {{
                    ViewInfo.workflow_visibility.visible_groups.length != 0
                      ? ViewInfo.workflow_visibility.visible_groups
                          .map((email) => fetch_user_group(email))
                          .join(", ")
                      : " -"
                  }}</span
                >
              </div>
              <div
                class="pt-2"
                v-if="ViewInfo.workflow_design_type == 'DEFAULT'"
              >
                <span
                  ><label class="font-weight-bold">Notification :</label>
                  {{
                    ViewInfo.notifications.length != 0
                      ? ViewInfo.notifications
                          .map((email) => fetch_user_Name(email))
                          .join(", ")
                      : " -"
                  }}</span
                >
              </div>
              <div
                class="pt-2"
                v-if="ViewInfo.workflow_design_type == 'DEFAULT'"
              >
                <span
                  ><label class="font-weight-bold"> Group head Notified:</label>
                  {{
                    ViewInfo.is_group_noftication_enabled == true ? "Yes" : "No"
                  }}</span
                >
              </div>
              <div class="pt-2">
                <div>
                  <label class="font-weight-bold"
                    >Webhook/Other Settings :</label
                  >
                </div>
                <span>
                  Invoke Url :
                  {{ ViewInfo.workflow_webhook.invoke_url }}
                  , Authorization :
                  {{ ViewInfo.workflow_webhook.authorization }}</span
                >
              </div>
            </v-col>
            <v-col cols="6">
              <div>
                <span
                  ><label class="font-weight-bold">Form Type :</label>
                  {{ handleformType(ViewInfo.workflow_design_type) }}</span
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
          <div
            v-if="ViewInfo.workflow_design_type == 'EXTERNAL_FORM'"
            class="mt-2"
          >
            <span
              ><label class="font-weight-bold">Url :</label>
              {{ ViewInfo.extern_publish_api.url }}
            </span>
          </div>

          <div
            v-if="ViewInfo.workflow_design_type == 'EXTERNAL_API'"
            class="mt-2"
          >
            <span><label class="font-weight-bold">API </label> </span>
          </div>
          <div
            v-if="ViewInfo.workflow_design_type == 'EXTERNAL_API'"
            class="mt-2"
          >
            <span
              ><label class="font-weight-bold">Url :</label>
              <span ref="myurl"> {{ ViewInfo.extern_publish_api.url }} </span>
              <v-btn x-small @click="copyurlToClipboard()" text
                ><v-icon small>mdi-content-copy</v-icon></v-btn
              >
            </span>
          </div>
          <div
            v-if="ViewInfo.workflow_design_type == 'EXTERNAL_API'"
            class="mt-2"
          >
            <span
              ><label class="font-weight-bold">X-API-Key :</label>
              {{ ViewInfo.extern_publish_api["x-api_key"] }}
            </span>
          </div>
          <div class="mt-2">
            <span v-if="ViewInfo.workflow_design_type == 'EXTERNAL_API'"
              ><label class="font-weight-bold"
                >Body :
                <v-btn x-small @click="copyToClipboard()" text
                  ><v-icon small>mdi-content-copy</v-icon></v-btn
                ></label
              >
            </span>
          </div>
          <div
            v-if="ViewInfo.workflow_design_type == 'EXTERNAL_API'"
            class="my-div mt-4"
            ref="mySpan"
          >
            {
            <p
              v-for="(value, key) in ViewInfo.extern_publish_api"
              :key="key"
              v-if="key !== 'url' && key !== 'x-api_key'"
            >
              <strong>"{{ key }}":</strong>
              <span v-if="key != 'workflow_payload'">"</span>{{ value
              }}<span v-if="key != 'workflow_payload'">"</span
              ><span v-if="key != 'workflow_payload'">,</span>
            </p>
            }
          </div>

          <!-- <p>
            Name: <b>{{ ViewInfo.workflow_name || "N/A" }}</b>
          </p>
          <p>
            Description: <b>{{ ViewInfo.workflow_description || "N/A" }}</b>
          </p>
          <p>
            Summary 1: <b>{{ ViewInfo.summary_field_1 || "N/A" }}</b>
          </p>
          <p>
            Summary 2: <b>{{ ViewInfo.summary_field_2 || "N/A" }}</b>
          </p>
          <p>
            Visibility:
            <b>
              {{
                ViewInfo.workflow_visibility?.visible_type === "ALL_MEMBERS"
                  ? "All Members"
                  : ViewInfo.workflow_visibility?.visible_type === "GROUPS" &&
                    Array.isArray(
                      ViewInfo.workflow_visibility.visible_groups
                    ) &&
                    ViewInfo.workflow_visibility.visible_groups.length
                  ? `Groups (${ViewInfo.workflow_visibility.visible_groups.join(
                      ", "
                    )})`
                  : "N/A"
              }}
            </b>
          </p>
          <p>
            Notifications:
            <b>{{
              ViewInfo.notifications?.length
                ? ViewInfo.notifications.join(", ")
                : "N/A"
            }}</b>
          </p>
          <p>
            Group head Notified:
            <b>{{ ViewInfo.is_group_noftication_enabled ? "Yes" : "No" }}</b>
          </p>
          <p>
            Web book settings:
            <b>{{
              ViewInfo.workflow_webhook
                ? `Authorization: ${ViewInfo.workflow_webhook.authorization}, Invoke URL: ${ViewInfo.workflow_webhook.invoke_url}`
                : "N/A"
            }}</b>
          </p>
          <p>
            Flow Steps:
            <b>
              {{
                ViewInfo.workflow_approval_steps?.length
                  ? ViewInfo.workflow_approval_steps
                      .map((step) =>
                        step.user_id !== "N/A"
                          ? `${step.user_type} (${step.user_id})`
                          : step.user_type
                      )
                      .join(", ")
                  : "N/A"
              }}
            </b>
          </p> -->
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
/* eslint-disable */

import { get_department_details } from "@/mixins/GetDepartments.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  mixins: [get_department_details, get_all_org_users],
  props: {
    viewForm: Boolean,
    ViewInfo: Object,
  },
  data() {
    return {
      userList: [],
    };
  },
  watch: {
    viewForm: {
      async handler() {
        if (this.viewForm == true) {
          await Promise.all([
            this.get_all_org_users(),
            this.get_department_details(),
          ]);

          this.userList = this.extractUserTypeAndId(
            this.ViewInfo.workflow_approval_steps
          );
        }
      },
      immediate: true,
    },
  },
  methods: {
    copyurlToClipboard() {
      const spanElement = this.$refs.myurl;
      const text = spanElement.innerText;

      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            // console.log("Text copied to clipboard");
            this.$emit("successMsg", "Text copied to clipboard");
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        console.error("Clipboard API not supported in this browser.");
      }
    },
    copyToClipboard() {
      const spanElement = this.$refs.mySpan;
      const text = spanElement.innerText;

      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            // console.log("Text copied to clipboard");
            this.$emit("successMsg", "Text copied to clipboard");
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        console.error("Clipboard API not supported in this browser.");
      }
    },
    extractUserTypeAndId(jsonString) {
      // Parse the JSON string
      const parsedData = jsonString;

      // Extract and return an array with `user_type` and `user_id`
      return parsedData.map((item) => ({
        user_type: item.user_type,
        user_id: item.user_id,
      }));
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
    close_dialog() {
      this.$emit("clicked", 0);
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
    formatKey(key) {
      // Format the key to make it human-readable (e.g., "workflow_id" -> "Workflow ID")
      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    },
    handleformType(val) {
      switch (val) {
        case "DEFAULT":
          return "Normal Flow";

        case "EXTERNAL_API":
          return "External API";

        case "EXTERNAL_FORM":
          return "External Form";

        case undefined:
          return "Normal Flow";

        default:
          return val;
      }
    },
  },
};
</script>

<style scoped>
.my-div {
  /* Width of the rectangle */
  padding: 10px;
  height: auto; /* Height of the rectangle */
  border: 3px solid black; /* Border thickness, style, and color */
}
</style>