<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogCloseReopenTicket" max-width="450px">
      <v-card rounded="xl">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Close/Reopen Ticket</span>
          <v-btn
            icon
            variant="text"
            @click="DialogCloseReopenTicketEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-row>
          <v-col cols="12" md="12">
            <div class="font-weight-bold mt-2 ml-3">Ticket Status</div>
            <v-select
              v-model="ticket_status"
              variant="outlined"
              density="compact"
              rounded="xl"
              class="mt-n2 ml-n1 pa-4"
              width="300"
              :rules="[(v) => !!v || 'Required']"
              :items="TicketStatusList"
              item-title="title"
              item-value="value"
            />
          </v-col>

          <v-col cols="12" md="12">
            <div class="font-weight-bold ml-3 mt-n10">Comments</div>
            <v-textarea
              rounded="xl"
              variant="outlined"
              v-model="ticket_comment"
              placeholder="Add a comment if you like..."
              class="mt-n2 pa-4"
            />
          </v-col>
        </v-row>

        <v-card-actions class="d-flex justify-end mt-n10">
          <v-btn
            rounded="lg"
            color="primary"
            @click="CloseReopenTicket"
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
import SnackBar from "../SnackBar.vue";

import { update_ticket } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: { DialogCloseReopenTicket: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    ticket_status: "",
    ticket_comment: "",

    loading: false,

    SnackBarComponent: {},

    TicketStatusList: [
      { title: "Reopen", value: "REOPEN" },
      { title: "Closed", value: "CLOSED" },
    ],
  }),

  watch: {
    DialogCloseReopenTicket(val) {
      if (val) {
        this.ticket_status = this.StoreObj.status;
      }
    },
  },

  methods: {
    DialogCloseReopenTicketEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async CloseReopenTicket() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(update_ticket, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
              status: this.ticket_status,
              comment: this.ticket_comment,
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
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
        }
        this.loading = false;
        this.DialogCloseReopenTicketEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to close/reopen ticket, try again",
        };
      }
      this.loading = false;
    },
  },
};
</script>
