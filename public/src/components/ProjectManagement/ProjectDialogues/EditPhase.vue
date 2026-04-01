<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog
      :model-value="phaseEdition"
      @update:model-value="$emit('update:phaseEdition', $event)"
      persistent
      max-width="550"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Project Phases</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <v-text-field
                  v-model="phaseName"
                  label="Phase Name*"
                  :rules="[(v) => !!v || 'required ']"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="displayFromDate"
                  variant="outlined"
                  density="compact"
                  :rules="[(v) => !!v || 'Required ']"
                  label="Start Date"
                  readonly
                  @click="fromDateDialog = true"
                >
                  <template #append-inner>
                    <v-icon @click="fromDateDialog = true">mdi-calendar</v-icon>
                  </template>
                </v-text-field>
                <v-dialog v-model="fromDateDialog" persistent max-width="325">
                  <v-card>
                    <v-date-picker
                      v-model="tempFromDate"
                      :min="projectMinDate"
                      :max="projectMaxDate"
                      color="primary"
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn variant="text" color="primary" @click="fromDateDialog = false">Cancel</v-btn>
                      <v-btn variant="text" color="primary" @click="saveFromDate">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="displayToDate"
                  variant="outlined"
                  density="compact"
                  class="ml-2"
                  label="End Date"
                  :rules="[(v) => !!v || 'Required ']"
                  readonly
                  @click="toDateDialog = true"
                >
                  <template #append-inner>
                    <v-icon @click="toDateDialog = true">mdi-calendar</v-icon>
                  </template>
                </v-text-field>
                <v-dialog v-model="toDateDialog" persistent max-width="325">
                  <v-card>
                    <v-date-picker
                      v-model="tempToDate"
                      :min="projectMinDate"
                      :max="projectMaxDate"
                      color="primary"
                    ></v-date-picker>
                    <v-card-actions>
                      <v-spacer />
                      <v-btn variant="text" color="primary" @click="toDateDialog = false">Cancel</v-btn>
                      <v-btn variant="text" color="primary" @click="saveToDate">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
          </v-form>
          <v-card-actions class="justify-end">
            <v-btn
              @click="validate_data()"
              :loading="loading"
              dark
              class="text-capitalize cardCss button-corner"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/*eslint-disable*/
import { create_list_edit_phases } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    phaseEdition: Boolean,
    projData: Object,
  },
  watch: {
    phaseEdition: {
      async handler() {
        if (this.phaseEdition == true) {
          let Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));
          this.projectMinDate = Projecctdetails.project_start_date;
          this.projectMaxDate = Projecctdetails.project_end_date;
          this.phaseName = this.projData.phase_name;
          this.fromDate = this.projData.phase_start_date;
          this.toDate = this.projData.phase_end_date;
          this.tempFromDate = this.fromDate;
          this.tempToDate = this.toDate;
        }
      },
      immediate: true,
    },
  },
  data() {
    return {
      fromDate: "",
      toDate: "",
      fromDateDialog: false,
      toDateDialog: false,
      tempFromDate: "",
      tempToDate: "",
      projectMinDate: "",
      projectMaxDate: "",
      phaseName: "",
      loading: false,
    };
  },
  computed: {
    displayFromDate() {
      if (!this.fromDate) return '';
      const d = new Date(this.fromDate);
      if (isNaN(d)) return this.fromDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    displayToDate() {
      if (!this.toDate) return '';
      const d = new Date(this.toDate);
      if (isNaN(d)) return this.toDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  },
  methods: {
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    close_dialog() {
      this.$emit("clicked", 0);

      this.$refs.form.reset();
      this.$refs.form.resetValidation();
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.add_mutation();
      }
    },
    async add_mutation() {
      this.loading = true;
      let data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_phases, {
            input: {
              phase_id: this.projData.phase_id,
              project_id: this.projData.project_id,
              phase_name: this.phaseName,
              action_type: "EDIT",
              phase_end_date: this.formatDate(this.toDate),
              phase_start_date: this.formatDate(this.fromDate),
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_list_edit_phases);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("calllist",0)
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    saveFromDate() {
      this.fromDate = this.tempFromDate;
      this.fromDateDialog = false;
    },
    saveToDate() {
      this.toDate = this.tempToDate;
      this.toDateDialog = false;
    },
  },
};
</script>