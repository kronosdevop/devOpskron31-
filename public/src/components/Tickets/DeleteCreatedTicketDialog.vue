<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog
      :model-value="DialogDeleteCreatedTicket"
      max-width="400px"
      persistent
    >
      <v-card rounded="xl">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Delete Ticket</span>
          <v-btn
            icon
            variant="text"
            @click="DialogDeleteCreatedTicketEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <div class="mt-3 d-flex justify-center">
          Are you sure you want to delete this ticket?
        </div>

        <v-form ref="form">
          <v-textarea
            v-model="reason"
            variant="outlined"
            class="pa-5 mt-n2"
            rounded="xl"
            height="30"
            rows="2"
            placeholder="Enter a reason..."
            :rules="[(v) => !!v || 'Required']"
          />
        </v-form>

        <v-card-actions class="d-flex justify-end mt-n9">
          <v-btn
            rounded="xl"
            color="primary"
            :loading="loading"
            @click="ValidateForm"
          >
            Delete
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
import { delete_ticket } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogDeleteCreatedTicket: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    reason: "",

    loading: false,

    SnackBarComponent: {},
  }),

  watch: {
    DialogDeleteCreatedTicket(val) {
      if (!val) {
        this.$refs.form.reset();
      }
    },
  },

  methods: {
    DialogDeleteCreatedTicketEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.DeleteTicket();
      }
    },
    async DeleteTicket() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(delete_ticket, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
              deletion_reason: this.reason,
            },
          })
        );
        let resultObj = JSON.parse(result.data.delete_ticket);
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
        this.DialogDeleteCreatedTicketEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to delete ticket, try again",
        };
      }
      this.loading = false;
    },
  },
};
</script>
