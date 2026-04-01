<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog
      :model-value="DialogEditAssignedTicket"
      max-width="650px"
      persistent
    >
      <v-card rounded="lg">
        <!--Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
        >
          <span class="font-weight-bold text-h5">Update Ticket Status</span>
          <v-btn
            icon
            variant="text"
            @click="DialogEditAssignedTicketEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="form">
          <v-row no-gutters class="pa-4">
            <!--Ticket Status-->
            <v-col cols="6" md="6">
              <div class="font-weight-bold ml-2">Ticket Status</div>
              <v-select
                v-model="update_ticket_status"
                variant="outlined"
                density="compact"
                rounded="lg"
                class="mt-1 ml-n1 pa-1"
                width="300"
                :rules="[(v) => !!v || 'Required']"
                :items="TicketStatusList"
                item-title="title"
                item-value="value"
              />
            </v-col>

            <!--Due Date-->
            <v-col cols="6" md="6">
              <div
                v-if="
                  update_ticket_status === 'IN_PROGRESS' ||
                  update_ticket_status === 'RESOLVED'
                "
                class="font-weight-bold ml-2"
              >
                Due Date
              </div>
              <div v-else class="font-weight-bold ml-2">On Hold Till</div>
              <v-menu v-model="DueDateMenu" :close-on-content-click="false">
                <template #activator="{ props }">
                  <v-text-field
                    :model-value="formattedDueDate"
                    v-bind="props"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    class="mt-1 ml-n1 pa-1"
                    width="300"
                    :rules="[(v) => !!v || 'Required']"
                    prepend-inner-icon="mdi-calendar-outline"
                  />
                </template>
                <v-date-picker
                  v-model="DueDate"
                  :min="new Date()"
                  header-color="primary"
                  :allowed-dates="allowedDates"
                >
                  <template #actions>
                    <v-btn variant="text" @click="DueDateMenu = false">
                      Close
                    </v-btn>
                  </template>
                </v-date-picker>
              </v-menu>
            </v-col>

            <!--Reassign To Agents-->
            <v-col cols="6" md="6" v-if="update_ticket_status != 'RESOLVED'">
              <div class="font-weight-bold ml-2">Reassign</div>
              <v-select
                v-model="reassigned_agents"
                :items="reassignAgents"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                rounded="lg"
                class="mt-1 ml-n1 pa-1"
                width="300"
              />
            </v-col>

            <!--Status Based Comments-->
            <v-col cols="12" md="12" v-if="update_ticket_status === 'RESOLVED'">
              <div class="font-weight-bold mt-n2 ml-2">Resolution Note</div>
              <v-textarea
                rounded="lg"
                variant="outlined"
                v-model="resolution_note"
                class="mt-1 ml-n1 pa-1"
                maxlength="200"
                :counter="200"
              />
            </v-col>

            <v-col cols="12" md="12" v-if="update_ticket_status === 'CLOSED'">
              <div class="font-weight-bold mt-n2 ml-2">Closure Note</div>
              <v-textarea
                rounded="lg"
                variant="outlined"
                v-model="closure_note"
                class="mt-1 ml-n1 pa-1"
                maxlength="200"
                :counter="200"
              />
            </v-col>

            <v-col
              cols="12"
              md="12"
              v-if="
                update_ticket_status === 'IN_PROGRESS' ||
                update_ticket_status === 'REASSIGNED' ||
                update_ticket_status === 'ONHOLD' ||
                update_ticket_status === 'CANCELLED'
              "
            >
              <div class="font-weight-bold mt-n2 ml-2">Comments</div>
              <v-textarea
                rounded="lg"
                variant="outlined"
                v-model="ticket_comments"
                placeholder="Add a comment if you like..."
                class="mt-1 ml-n1 pa-1"
                maxlength="200"
                :counter="200"
              />
            </v-col>
          </v-row>
        </v-form>

        <!--Action Buttons-->
        <v-card-actions class="d-flex justify-end mt-n8">
          <v-btn
            color="primary"
            rounded="lg"
            class="mb-1 mr-1"
            :loading="loading"
            @click="ValidateForm"
          >
            Update
            <template #loader>
              <v-progress-circular color="primary" indeterminate />
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { GetAllListAssignedTickets } from "@/mixins/GetAllListAssignedTickets";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { update_ticket } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogEditAssignedTicket: Boolean, StoreObj: Object },

  components: { SnackBar },

  mixins: [GetAllListAssignedTickets, get_all_org_users, uploadToS3],

  data: () => ({
    update_ticket_status: "",
    reassigned_agents: "",
    ticket_comments: "",
    resolution_note: "",
    closure_note: "",

    DueDate: new Date(),

    loading: false,
    DueDateMenu: false,

    SnackBarComponent: {},

    TicketStatusList: [
      { title: "In-Progress", value: "IN_PROGRESS" },
      { title: "On Hold", value: "ONHOLD" },
      { title: "Resolved", value: "RESOLVED" },
    ],
    ResponseStatusItems: [
      { title: "Yet to Respond", value: "YET_TO_RESPOND" },
      { title: "Responded", value: "RESPONDED" },
      { title: "Awaiting Customer Response", value: "AWAITING_CUSTOMER" },
      { title: "Customer Responded", value: "CUSTOMER_RESPONDED" },
    ],
    ListAllAssignedTickets: [],
  }),

  watch: {
    DialogEditAssignedTicket(val) {
      if (val) {
        this.update_ticket_status = this.StoreObj.status;
        this.DueDate = this.StoreObj.due_date
          ? new Date(this.StoreObj.due_date * 1000)
          : new Date();
        return this.fetchAssignedTicketData();
      }
    },
    update_ticket_status(val) {
      if (val === "RESOLVED") {
        this.DueDate = new Date();
      }
    },
  },

  computed: {
    userList() {
      return this.orgUsers
        .filter((user) => user.user_status === "ACTIVE")
        .map((user) => ({
          title: user.user_email_id,
          value: user.user_email_id,
        }));
    },
    currentUserEmail() {
      return this.$store.getters.GetUserEmail;
    },
    reassignAgents() {
      return (this.StoreObj?.agents_list || [])
        .filter((email) => email !== this.currentUserEmail)
        .map((email) => ({
          title: email,
          value: email,
        }));
    },
    formattedDueDate() {
      if (!this.DueDate) return "";
      return this.ConvertDueDate(this.DueDate);
    },
  },

  methods: {
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.UpdateAssignedTicket();
      }
    },
    async UpdateAssignedTicket() {
      this.loading = true;
      try {
        let input = {
          ticket_id: this.StoreObj.ticket_id,
          status: this.update_ticket_status,
          assigned_to_email: this.reassigned_agents,
          due_date: Math.floor(this.DueDate.getTime() / 1000),
        };
        if (
          this.update_ticket_status === "IN_PROGRESS" ||
          this.update_ticket_status === "ONHOLD" ||
          this.update_ticket_status === "CANCELLED"
        ) {
          input.comment = this.ticket_comments || "";
        }
        if (this.update_ticket_status === "RESOLVED") {
          input.resolution_note = this.resolution_note || "";
        }
        if (this.update_ticket_status === "CLOSED") {
          input.closure_note = this.closure_note || "";
        }
        const result = await API.graphql(
          graphqlOperation(update_ticket, { input })
        );
        const resultObj = JSON.parse(result.data.update_ticket);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
        }
        this.loading = false;
        this.DialogEditAssignedTicketEmit(2);
      } catch (error) {
        console.error("Update ticket error:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to update ticket.",
        };
        this.loading = false;
      }
    },
    async fetchAssignedTicketData() {
      await this.GetAllListAssignedTicketsMethod();
      await this.get_all_org_users();
    },
    allowedDates(date) {
      if (this.update_ticket_status === "RESOLVED") {
        const today = new Date();
        const d = new Date(date);
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      }
      return date >= new Date();
    },
    ConvertDueDate(DueDate) {
      const date = new Date(DueDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    DialogEditAssignedTicketEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
  },
};
</script>
