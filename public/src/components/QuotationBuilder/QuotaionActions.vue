<template>
  <div>
    <v-toolbar class="mt-2" dense flat >
      <v-btn-toggle
        v-model="quotationToggle"
        class="theme-toggle ml-4"
        mandatory
        divided
        density="compact"
        variant="outlined"
      >
        <v-btn
          size="small"
          :class="[
            'font-size-btn text-capitalize ',
            quotationToggle === 'quotations' ? 'active-btn' : '',
          ]"
          text
          value="quotations"
        >
          Quotation
        </v-btn>
        <v-btn
          size="small"
          :class="[
            'font-size-btn text-capitalize ',
            quotationToggle === 'proforma' ? 'active-btn' : '',
          ]"
          text
          value="proforma"
        >
          Proforma
        </v-btn>
        <v-btn
          size="small"
          :class="[
            'font-size-btn text-capitalize ',
            quotationToggle === 'billing' ? 'active-btn' : '',
          ]"
          text
          value="billing"
        >
          Billing
        </v-btn>
        <v-btn
          size="small"
          :class="[
            'font-size-btn text-capitalize ',
            quotationToggle === 'termsconditions' ? 'active-btn' : '',
          ]"
          text
          value="termsconditions"
        >
          T&C Configuration
        </v-btn>
        <v-btn
          size="small"
          :class="[
            'font-size-btn text-capitalize ',
            quotationToggle === 'emailtemplate' ? 'active-btn' : '',
          ]"
          text
          value="emailtemplate"
        >
          Email Template
        </v-btn>
        <v-btn
          size="small"
          :class="[
            'font-size-btn text-capitalize ',
            quotationToggle === 'emaillogs' ? 'active-btn' : '',
          ]"
          text
          value="emaillogs"
        >
          Email Logs
        </v-btn>
        <v-btn
          size="small"
          :class="[
            'font-size-btn text-capitalize ',
            quotationToggle === 'additionalEntity' ? 'active-btn' : '',
          ]"
          text
          value="additionalEntity"
        >
          Additional Entity
        </v-btn>
      </v-btn-toggle>
      <v-spacer />
      <v-btn
        v-show="quotationToggle == 'quotations'"
        @click="generate_action()"
        class="cardCss text-capitalize mr-4"
        dark
        size="small"
        >Generate
      </v-btn>
      <v-btn
        v-show="quotationToggle == 'proforma'"
        @click="generate_proforma()"
        class="cardCss text-capitalize mr-4"
        dark
        size="small"
        >Generate
      </v-btn>
      <v-btn
        v-show="quotationToggle == 'billing'"
        @click="generate_billing()"
        class="cardCss text-capitalize mr-4"
        dark
        size="small"
        >Generate
      </v-btn>
    </v-toolbar>
    <div class="text-left" v-if="quotationToggle == 'quotations'">
      <v-card
        flat
        class="overflow-auto"
        
      >
        <QuatotaionList />
      </v-card>
    </div>
    <div class="text-left" v-if="quotationToggle == 'proforma'">
      <v-card
        flat
        class="overflow-auto"
        
      >
        <ProformaInvoice />
      </v-card>
    </div>

    <div class="text-left" v-if="quotationToggle == 'billing'">
      <v-card
        flat
        class="overflow-auto"
        
      >
        <BillingQuotation />
      </v-card>
    </div>

    <div class="text-left" v-if="quotationToggle == 'termsconditions'">
      <TermsConditions />
    </div>
    <div class="text-left" v-if="quotationToggle == 'emailtemplate'">
      <v-card
        flat
        class="overflow-auto"
        
      >
        <EmailTemplate />
      </v-card>
    </div>
    <div class="text-left" v-if="quotationToggle == 'emaillogs'">
      <v-card
        flat
        class="overflow-auto"
        
      >
        <EmailLogs />
      </v-card>
    </div>
    <div class="text-left" v-if="quotationToggle == 'additionalEntity'">
      <v-card
        flat
        class="overflow-auto"
        
      >
        <OrganizationEntity />
      </v-card>
    </div>
    <div v-if="componentCheck == 1">
      <SelectionDialogue
        :quotationSelection="quotationSelection"
        v-on:fetchValue="fetch_info"
        @clicked="quotationSelection = false"
      ></SelectionDialogue>
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- <v-card class="" flat > </v-card> -->
  </div>
</template>
<script>
/*eslint-disable*/
import ProformaInvoice from "@/components/QuotationBuilder/ProformaInvoice.vue";
import QuatotaionList from "@/components/QuotationBuilder/QuatotaionList.vue";
import TermsConditions from "@/components/QuotationBuilder/TermsConditions.vue";
import SelectionDialogue from "@/components/QuotationBuilder/PopupsDialogues/SelectionDialogue.vue";
import BillingQuotation from "@/components/QuotationBuilder/BillingQuotation.vue";
import EmailTemplate from "@/components/QuotationBuilder/EmailTemplate.vue";
import EmailLogs from "./EmailLogs.vue";
import SnackBar from "@/components/SnackBar.vue";
import { get_termsAndcondition_list } from "@/mixins/GetTermsandConditionList";
import OrganizationEntity from "@/components/SettingsComponents/OrganizationEntity.vue";

export default {
  mixins: [get_termsAndcondition_list],
  components: {
    QuatotaionList,
    TermsConditions,
    SelectionDialogue,
    BillingQuotation,
    EmailTemplate,
    EmailLogs,
    SnackBar,
    OrganizationEntity,
    ProformaInvoice,
  },
  data() {
    return {
      quotationToggle: "quotations",
      componentCheck: 0,
      quotationSelection: false,
      SnackBarComponent: {},
      cardHeight: 0,
    };
  },

  watch: {
    quotationToggle(newVal) {
      localStorage.setItem("quotationToggle", newVal);
    },
  },
  mounted() {
    const savedTab = localStorage.getItem("quotationToggle");
    if (savedTab) {
      this.quotationToggle = savedTab;
    }
    this.get_termsAndcondition_list();
    this.cardHeight = window.innerHeight - 125;
  },
  methods: {
    generate_action() {
      let prefix =
        this.$store.getters.GetTermsandConditions.quotation_prefix || "";
      let termsconditions =
        this.$store.getters.GetTermsandConditions.data[0]
          .quotation_terms_conditions || "";
      if (prefix == "" && termsconditions == "") {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Both Terms and Conditions and a prefix are required.",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.$router.push("/home/QuotationGeneration");
      }
    },
    generate_proforma() {
      let prefix =
        this.$store.getters.GetTermsandConditions.proforma_prefix || "";
      let termsconditions =
        this.$store.getters.GetTermsandConditions.data[0]
          .proforma_terms_conditions || "";
      if (prefix == "" && termsconditions == "") {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Both Terms and Conditions and a prefix are required.",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.$router.push("/home/ProformaGeneration");
      }
    },

    generate_billing() {
      let prefix =
        this.$store.getters.GetTermsandConditions.billing_prefix || "";
      let termsconditions =
        this.$store.getters.GetTermsandConditions.data[0]
          .billing_terms_conditions || "";
      if (prefix == "" && termsconditions == "") {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Both Terms and Conditions and a prefix are required.",
          timeout: 5000,
          Top: true,
        };
      } else {
        this.componentCheck = 2;
        this.$router.push("/home/BillingGeneration");
      }
    },

    fetch_info(value) {
      // console.log(value);
      if (value == "Quotation") {
        this.$router.push("/home/QuotationGeneration");
      }
    },
  },
};
</script>

<style scoped>
.theme-toggle {
  background-color: transparent;
  border-radius: 10px;
  padding: 4px;
  display: inline-flex;
}

.theme-btn {
  border-radius: px !important;
}

.theme-btn.v-btn--active {
  background-color: #1e3e5c !important;
  color: #1a202c !important;
}

.active-btn {
  color: white !important;
  background-color: #1e3e5c !important;
  border-radius: 10px !important;
}

.font-size-btn {
  font-size: 12px;
  font-weight: 500;
}
</style>