<template>
  <div>
    <v-card class="pa-6 ma-3" variant="flat" rounded="xl" elevation="2">
      <!-- Header -->
      <div class="d-flex align-center mb-4">
        <v-icon color="primary" class="mr-2">mdi-bell-outline</v-icon>
        <span class="text-h6 font-weight-bold">Notification Configuration</span>
      </div>

      <v-divider class="mb-6"></v-divider>

      <!-- Ongoing Notification -->
      <v-card variant="flat" class="pa-5 mb-6 setting-card" rounded="lg">
        <div class="d-flex justify-space-between align-center mb-2">
          <div>
            <div class="text-subtitle-1 font-weight-medium">
              Ongoing Project Notifications
            </div>

            <div class="text-caption text-grey">
              Choose which roles should receive updates for ongoing projects.
            </div>
          </div>

          <v-switch
            v-model="ongoingNotification"
            color="primary"
            hide-details
          />
        </div>

        <!-- Roles -->
        <div class="mt-4">
          <div class="text-caption mb-2 text-grey">Notify Roles</div>

          <v-chip-group
            v-model="selectedRoles"
            multiple
            column
            :disabled="!ongoingNotification"
          >
            <v-chip value="Owner" filter color="primary" variant="outlined"
              >Owner</v-chip
            >
            <v-chip value="Admin" filter color="primary" variant="outlined"
              >Admin</v-chip
            >
            <v-chip value="Member" filter color="primary" variant="outlined"
              >Members</v-chip
            >
            <v-chip value="Observer" filter color="primary" variant="outlined"
              >Observer</v-chip
            >
          </v-chip-group>
        </div>
      </v-card>

      <!-- Due Date Notification -->
      <v-card variant="flat" class="pa-5 mb-6 setting-card" rounded="lg">
        <div class="text-subtitle-1 font-weight-medium">
          Project Due Date Notifications
        </div>

        <div class="text-caption text-grey mb-3">
          Receive alerts when project due dates are approaching.
        </div>

        <v-radio-group v-model="dueDateNotification" color="primary" inline>
          <v-radio label="Enable" value="ENABLE"></v-radio>
          <v-radio label="Disable" value="DISABLE"></v-radio>
        </v-radio-group>
      </v-card>

      <!-- Overdue Reminder Configuration -->
      <v-card variant="flat" class="pa-5 setting-card" rounded="lg">
        <div class="text-subtitle-1 font-weight-medium">
          Overdue Reminder Configuration
        </div>

        <div class="text-caption text-grey mb-3">
          Choose how many days before the project due date the reminder
          notification should be sent.
        </div>

        <v-select
          v-model="reminderDays"
          :items="daysOptions"
          label="Send Reminder Before Due Date"
          variant="outlined"
          density="comfortable"
          :disabled="dueDateNotification === 'DISABLE'"
        />
      </v-card>

      <!-- Save Button -->
      <div class="d-flex justify-end mt-6">
        <v-btn color="primary" @click="update_notification()" :loading="btnloading" rounded="lg" elevation="1">
          Save Settings
        </v-btn>
      </div>
    </v-card>
    <OverlayComp :overlay="overlay" />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { get_project_notification_settings } from "@/graphql/queries.js";
import { update_project_notification_settings } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import OverlayComp from "@/components/OverlayComp.vue";

export default {
  components: {
    SnackBar,
    OverlayComp,
  },
  data() {
    return {
      ongoingNotification: false,
      dueDateNotification: "ENABLE",
      selectedRoles: [],
      reminderDays: 3,
      overlay: false,
      SnackBarComponent: {},
      NotificationData: [],
      btnloading: false,
      daysOptions: Array.from({ length: 10 }, (_, i) => ({
        title: `${i + 1} Day${i + 1 > 1 ? "s" : ""} Before`,
        value: i + 1,
      })),
    };
  },

  async created() {
    await this.fetch_notification_details();
  },
  methods: {
    async fetch_notification_details() {
      this.overlay = true;

      var projectDetails = JSON.parse(localStorage.getItem("projectInfo"));

      try {
        let result = await API.graphql(
          graphqlOperation(get_project_notification_settings, {
            input: {
              project_id: projectDetails.project_id,
            },
          })
        );

        var response = JSON.parse(
          result.data.get_project_notification_settings
        );

        if (response.Status === "SUCCESS") {
          const settings = response.data.notification_settings;

          // Ongoing Notification
          this.ongoingNotification = settings.ongoing_notifications.is_enabled;
          this.selectedRoles =
            settings.ongoing_notifications.notify_roles || [];

          // Due Date Notification
          this.dueDateNotification = settings.due_date_notifications.is_enabled
            ? "ENABLE"
            : "DISABLE";

          // Reminder Days
          this.reminderDays =
            settings.overdue_reminder.reminder_days_before || 1;

          this.NotificationData = response.data;
        } else {
          this.NotificationData = [];
        }

        this.overlay = false;
      } catch (error) {
        this.overlay = false;

        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.message,
          timeout: 5000,
          Top: true,
        };
      }
    },

   async update_notification() {

  this.btnloading = true;

  var projectDetails = JSON.parse(localStorage.getItem("projectInfo"));

  try {

    let result = await API.graphql(
      graphqlOperation(update_project_notification_settings, {
        input: {
          project_id: projectDetails.project_id,

          notification_settings: {
            ongoing_notifications: {
              is_enabled: this.ongoingNotification,
              notify_roles: this.ongoingNotification ? this.selectedRoles : []
            },

            due_date_notifications: {
              is_enabled: this.dueDateNotification === "ENABLE"
            },

            overdue_reminder: {
              reminder_days_before: this.reminderDays
            }
          }

        }
      })
    );

    var response = JSON.parse(
      result.data.update_project_notification_settings
    );

    if (response.Status === "SUCCESS") {

      await this.fetch_notification_details();

      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: response.Message,
        timeout: 5000,
        Top: true,
      };

    } else {

      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: response.Message,
        timeout: 5000,
        Top: true,
      };

    }

    this.btnloading = false;

  } catch (error) {

    this.btnloading = false;

    this.SnackBarComponent = {
      SnackbarVmodel: true,
      SnackbarColor: "red",
      SnackbarText: error.message,
      timeout: 5000,
      Top: true,
    };

  }

},
  },
};
</script>

<style scoped>
.setting-card {
  background: #fafafa;
  border: 1px solid #eeeeee;
}

.text-grey {
  color: #6b7280;
}
</style>