<template>
  <div>
    <v-dialog
      :model-value="DialogAssignedTicketDetails"
      max-width="500px"
      persistent
    >
      <v-card rounded="xl">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
        >
          <span class="font-weight-bold text-h5">Ticket Details</span>
          <v-btn
            icon
            variant="text"
            @click="DialogAssignedTicketDetailsEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <div style="max-height: 500px; overflow-y: auto">
          <v-progress-circular
            v-if="loading"
            indeterminate
            color="primary"
            class="d-block mx-auto my-4"
          />
          <template v-else-if="!loading">
            <div class="d-flex align-center pa-3">
              <div class="font-weight-bold">Ticket Assigned to:</div>
              <i class="ml-2">
                {{ ListAllAssignedTicketDetails.assigned_to_email }}
              </i>
            </div>

            <div class="font-weight-bold ml-3">Comments</div>
            <div class="pa-3">
              <v-card
                v-for="(item, index) in ListAllAssignedTicketDetailsComments"
                :key="index"
                width="100%"
                rounded="xl"
                class="pa-3 settings-card"
                elevation="3"
              >
                <v-card-text class="pt-0">{{ item.comment_text }}</v-card-text>
                <v-card-subtitle
                  class="text-caption text-medium-emphasis mt-n3"
                >
                  {{ ConvertDate(item.created_at) }}
                </v-card-subtitle>
              </v-card>
            </div>
          </template>
          <div v-else>Sorry, no comments to list!</div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { get_ticket_by_id } from "@/graphql/queries";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: { DialogAssignedTicketDetails: Boolean, StoreObj: Object },

  data: () => ({
    ListAllAssignedTicketDetails: [],
    ListAllAssignedTicketDetailsComments: [],
    loading: false,
  }),

  watch: {
    async DialogAssignedTicketDetails(val) {
      if (val) {
        await this.fetchTicketDetails();
      }
    },
  },

  methods: {
    DialogAssignedTicketDetailsEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async GetAssignedTicketDetails() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(get_ticket_by_id, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
              include_comments: true,
              include_assignments: true,
            },
          })
        );
        let resultObj = JSON.parse(result.data.get_ticket_by_id);
        if (resultObj.Status === "SUCCESS") {
          this.ListAllAssignedTicketDetails = resultObj.data.ticket;
          this.ListAllAssignedTicketDetailsComments = resultObj.data.comments;
          this.ListAllAssignedTicketDetailsComments.sort((a,b) => b.created_at - a.created_at);
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllAssignedTicketDetails = [];
        this.ListAllAssignedTicketDetailsComments = [];
      }
    },
    async fetchTicketDetails() {
      await this.GetAssignedTicketDetails();
    },
    ConvertDate(created_at) {
      if (!created_at) return "N/A";
      const timestamp = Number(created_at);
      if (isNaN(timestamp)) return "Invalid Date";
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return "Invalid Date";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${hours}:${minutes} ${ampm}`;
      return `${dd}-${mm}-${yyyy}, ${time}`;
    },
  },
};
</script>

<style scoped>
.settings-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  background: white !important;
  border: 1px solid transparent !important;
}
.settings-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}
.gradient-border-card {
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}
</style>
