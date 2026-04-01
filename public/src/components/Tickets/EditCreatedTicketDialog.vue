<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog
      :model-value="DialogEditCreatedTicketDialog"
      max-width="650px"
      persistent
    >
      <v-card rounded="xl">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
        >
          <span class="font-weight-bold text-h5">Edit Ticket</span>
          <v-btn
            icon
            variant="text"
            @click="DialogEditCreatedTicketEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <!--Form Fields-->
        <div style="max-height: 500px; overflow-y: auto">
          <v-form ref="form">
            <v-row no-gutters class="pa-4">
              <v-col cols="6" md="6">
                <div class="font-weight-bold ml-2">Ticket Title</div>
                <v-text-field
                  v-model="update_ticket_title"
                  variant="outlined"
                  density="compact"
                  rounded="xl"
                  class="mt-1 ml-n1 pa-1"
                  width="300"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>

              <v-col cols="6" md="6">
                <div class="font-weight-bold">Ticket Type</div>
                <v-select
                  v-model="update_ticket_type"
                  variant="outlined"
                  density="compact"
                  rounded="xl"
                  class="mt-1 ml-n1 pa-1"
                  width="300"
                  :rules="[(v) => !!v || 'Ticket type is required']"
                  :items="ticketTypeList"
                  item-title="title"
                  item-value="value"
                />
              </v-col>

              <v-col cols="12" md="12">
                <div class="font-weight-bold ml-2">Ticket Description</div>
                <v-textarea
                  v-model="update_ticket_description"
                  variant="outlined"
                  density="compact"
                  rounded="xl"
                  class="mt-1 ml-n1 pa-1"
                />
              </v-col>
            </v-row>
          </v-form>
        </div>

        <!--Button-->
        <v-card-actions class="d-flex justify-end mt-n4">
          <v-btn
            rounded="lg"
            color="primary"
            class="mb-1 mr-1"
            @click="ValidateForm"
            :loading="loading"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { GetAllListTicketTypes } from "@/mixins/GetAllListTicketTypes";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { update_ticket } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: {
    DialogEditCreatedTicketDialog: Boolean,
    StoreObj: Object,
    orgDetails: Object,
  },

  mixins: [GetAllListTicketTypes, uploadToS3],

  components: { SnackBar },

  data: () => ({
    update_ticket_title: "",
    update_ticket_description: "",
    update_ticket_type: "",
    update_ticket_status: "",

    updateEnteredDueDate: new Date(),

    updateDueDateMenu: false,

    updateSelectedFile: null,
    updateImagePreview: null,
    updateImageUrl: null,

    loading: false,

    SnackBarComponent: {},

    TicketStatusList: [
      { title: "Re-Open", value: "REOPEN" },
      { title: "Closed", value: "CLOSED" },
    ],
  }),

  watch: {
    DialogEditCreatedTicketDialog(val) {
      if (val && this.StoreObj) {
        this.fetchEditTicketApi();
        this.update_ticket_title = this.StoreObj.title;
        this.update_ticket_description = this.StoreObj.description;
        this.update_ticket_type = this.StoreObj.ticket_type_id;
      }
    },
  },

  computed: {
    ticketTypeList() {
      return this.ListAllTicketTypes.map((ticket) => ({
        title: ticket.ticket_type_name,
        value: ticket.ticket_type_id,
      }));
    },
    formattedDueDate() {
      if (!this.updateEnteredDueDate) return "";
      return this.ConvertDate(this.updateEnteredDueDate);
    },
  },

  methods: {
    DialogEditCreatedTicketEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    ConvertDate(updateEnteredDueDate) {
      const date = new Date(updateEnteredDueDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.UpdateTicket();
      }
    },
    async UpdateTicket() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(update_ticket, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
              title: this.update_ticket_title,
              description: this.update_ticket_description,
            },
          })
        );
        let resultObj = JSON.parse(result.data.update_ticket);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
          this.DialogEditCreatedTicketEmit(2);
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
        }
        this.loading = false;
      } catch (error) {
        console.error("Update error:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to update ticket, try again!",
        };
        this.loading = false;
      }
    },
    async fetchEditTicketApi() {
      await this.GetAllListTicketTypesMethod();
    },
  },
};
</script>
