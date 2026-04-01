<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogDeleteTicketType" max-width="400px">
      <v-card rounded="xl">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h6">Delete Ticket Type</span>
          <v-btn
            icon
            variant="text"
            @click="DialogDeleteTicketTypeEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <div class="d-flex justify-center mt-3">
          Are you sure you want to delete this ticket type?
        </div>
        <v-card-actions class="d-flex justify-end" @click="DeleteTicketType">
          <v-btn color="primary" rounded="xl" :loading="loading">
            Delete
            <template #loader>
              <v-progress-circular indeterminate color="primary" />
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { create_list_edit_delete_ticket_type } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogDeleteTicketType: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    loading: false,

    SnackBarComponent: {},
  }),

  methods: {
    DialogDeleteTicketTypeEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async DeleteTicketType() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_ticket_type, {
            input: {
              action_type: "DELETE",
              ticket_type_id: this.StoreObj.ticket_type_id,
            },
          })
        );
        let resultObj = JSON.parse(
          result.data.create_list_edit_delete_ticket_type
        );
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: resultObj.Message,
          };
        }
        this.loading = false;
        this.DialogDeleteTicketTypeEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to delete ticket type, try again",
        };
      }
      this.loading = false;
    },
  },
};
</script>
