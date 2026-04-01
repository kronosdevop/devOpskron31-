<template>
  <div>
    <v-toolbar flat>
      <v-row class="ml-4">
        <v-btn-toggle v-model="toggle_exclusive" color="grey" mandatory>
          <v-btn small class="black--text" text value="Crmview"
            >Repository</v-btn
          >
          <v-btn small class="black--text" text value="incdentproduct">
            Product
          </v-btn>
          <!-- <v-btn small class="black--text" text value="campaigns">
            Campaigns
          </v-btn> -->
        </v-btn-toggle>
      </v-row>
      <v-spacer />
      <v-btn dark class="text-capitalize cardCss" @click="back_call()">
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <div class="text-left" v-if="toggle_exclusive == 'Crmview'">
      <CrmList />
    </div>
    <div class="text-left" v-if="toggle_exclusive == 'incdentproduct'">
      <ProductCrmlist />
    </div>
    <!-- <div class="text-left" v-if="toggle_exclusive == 'campaigns'">
      <CampaignsList />
    </div> -->
  </div>
</template>
           
<script>
import CrmList from "@/components/CRM/CrmList.vue";
import ProductCrmlist from "@/components/CRM/ProductCrmlist.vue";
// import CampaignsList from "@/components/CRM/CampaignsList.vue";

export default {
  components: {
    ProductCrmlist,
    // CampaignsList,
    CrmList,
  },
  data: () => ({
    toggle_exclusive: "Crmview",
  }),
  created() {
    if (this.$router.history.current.params.formMethod == "incdentproduct") {
      this.toggle_exclusive = "incdentproduct";
    } else if (this.$router.history.current.params.formMethod == "campaigns") {
      this.toggle_exclusive = "campaigns";
    }
  },
  methods: {
    back_call() {
      this.$router.push("/UserlevelApp");
    },
  },
};
</script>
          
          