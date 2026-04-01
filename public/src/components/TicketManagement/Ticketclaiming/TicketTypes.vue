<template>
  <div>
    <v-card flat class="mt-n4">
    <!-- <v-card-title>Assigned Tickets</v-card-title> -->
    <v-toolbar class="mt-6" dense flat>
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="claim_tickets">
            Assigned Ticket
          </v-btn>

          <v-btn small class="black--text" text value="historyticket">
            History
          </v-btn>
        </v-btn-toggle>
    </v-toolbar>
  </v-card>
    <div class="text-left" v-if="toggle_exclusive == 'claim_tickets'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <TicketClaim />
      </v-card>
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'historyticket'">
      <v-card flat :height="cardHeight" class="overflow-auto">
        <TicketHistory />
      </v-card>
    </div>
  </div>
</template>

<script>
import TicketClaim from "@/components/TicketManagement/Ticketclaiming/TicketClaim.vue";
import TicketHistory from "@/components/TicketManagement/Ticketclaiming/TicketHistory.vue";
export default {
  components: {
    TicketClaim,
    TicketHistory,
  },
  data: () => ({
    toggle_exclusive: "claim_tickets",
    cardHeight: 0,
  }),

  mounted() {
    this.cardHeight = window.innerHeight - 125;
  },
};
</script>

<style>
</style>