<template>
  <div>
    <v-toolbar dense flat>
      <!-- <v-toolbar-title>Approvals</v-toolbar-title> -->

      <v-row class="ml-2 mt-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="Pending_list">
            Pending
          </v-btn>
          <v-btn small class="black--text" text value="Submitted_list">
            Initiated
          </v-btn>
          <v-btn small class="black--text" text value="participated_list">
            Participated
          </v-btn>

          <!-- <v-btn
            v-if="
              $store.getters.GetUserObj.user.user_type == 'ADMIN' ||
              $store.getters.GetUserObj.user.user_type == 'OWNER'
            "
            small
            class="black--text"
            text
            value="test"
          >
            All Transactions
          </v-btn> -->
        </v-btn-toggle>
      </v-row>
      <v-spacer />
      <!-- <v-btn
        class="mx-2"
        @click="fetch_toogle_type()"
        fab
        dark
        x-small
        color="primary"
      >
        <v-icon dark> mdi-refresh </v-icon>
      </v-btn> -->
      <!-- <v-btn dark class="text-capitalize cardCss" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn> -->
    </v-toolbar>
    <div class="text-left" v-if="toggle_exclusive == 'Pending_list'">
      <PendingList />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'participated_list'">
      <ParticipatedList />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'Submitted_list'">
      <SubmitedList />
    </div>
    <!-- <div class="text-left" v-if="toggle_exclusive == 'test'">
      <AllTransactions />
    </div> -->
  </div>
</template>
  
  <script>
/* eslint-disable */
import PendingList from "@/components/Approvals/PendingList.vue";
import SubmitedList from "@/components/Approvals/SubmitedList.vue";
// import AllTransactions from "@/components/Approvals/AllTransactions.vue";
import ParticipatedList from "@/components/Approvals/ParticipatedList.vue";
import { EventBus } from "@/main";

export default {
  components: {
    PendingList,
    SubmitedList,
    // AllTransactions,
    ParticipatedList,
  },
  data: () => ({
    toggle_exclusive: "Pending_list",

    approvalCheck: 0,
    submittedCheck: 0,
    pendingCheck: 0,
    currentDeatails: {},
  }),
  watch: {
    // toggle_exclusive(newValue, oldValue) {
    //   // Check for changes in adminToggle
    //   if (newValue !== oldValue && oldValue !== null && oldValue !== "") {
    //     // If the value changed, handle the change here
    //     this.get_changes_data(newValue);
    //   }
    // },
  },

  methods: {
    back_call() {
      this.$router.push("/UserlevelApp");
    },

    fetch_toogle_type() {
      this.approvalCheck = 0;
      this.submittedCheck = 0;
      this.pendingCheck = 0;

      if (this.toggle_exclusive == "Pending_list") {
        this.pendingCheck += 1;
      } else if (this.toggle_exclusive == "Submitted_list") {
        this.submittedCheck += 1;
      } else if (this.toggle_exclusive == "participated_list") {
        this.approvalCheck += 1;
      }
    },

    get_changes_data(value) {},
  },
};
</script>

  
  