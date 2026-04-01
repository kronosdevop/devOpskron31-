<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogClaimStatus" max-width="450px">
      <v-card rounded="xl">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5"> Claim Ticket - {{ StoreObj.ticket_id }} </span>
          <v-btn
            icon
            variant="text"
            @click="DialogClaimStatusEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <div class="d-flex justify-center mt-3">
          Do you want to claim this ticket?
        </div>

        <v-card-actions class="d-flex justify-end">
          <v-btn
            color="primary"
            rounded="xl"
            @click="ChangeStatus"
            :loading="loading"
          >
            Claim
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
import { claim_external_ticket } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogClaimStatus: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    loading: false,

    SnackBarComponent: {},
  }),

  methods: {
    DialogClaimStatusEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async ChangeStatus() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(claim_external_ticket, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
            },
          })
        );
        let resultObj = JSON.parse(result.data.claim_external_ticket);
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
        this.DialogClaimStatusEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: '❎ Failed to claim ticket, try again',
        };
      }
      this.loading = false;
    },
  },
};
</script>
