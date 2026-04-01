<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog :model-value="payslipedition" @update:model-value="$emit('update:payslipedition', $event)" persistent max-width="600" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            ><div class="custom-title">
              Edit Payslip for {{ rowInfo.employee_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="12">
                <div
                  v-for="(value, key) in filteredEmployeeData"
                  :key="key"
                  class="mb-2"
                >
                  <v-text-field
                    dense
                    v-model="filteredEmployeeData[key]"
                    :label="formatLabel(key)"
                    class="mr-2"
                    outlined
                    :rules="[(v) => !!v || 'Required']"
                  ></v-text-field>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="saveData()"
            :loading="loading"
            class="text-capitalize cardCss button-corner"
            >Submit</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
        <script>
/* eslint-disable */
import { edit_delete_payslips } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    payslipedition: Boolean,
    rowInfo: Object,
  },

  data() {
    return {
      employeelist: "",
      loading: false,
      reasonchange: "",

      depertmentlist: "",
      depertmentitems: [],
    };
  },
  watch: {
    payslipedition: {
      async handler() {
        if (this.payslipedition == true) {
        
        }
      },
      immediate: true,
    },
  },
  computed: {
    filteredEmployeeData() {
  
      var {
        organization_id,
        employee_name,
        month_year,
        month,
        email_id,
        year,
        payslip_id,
        payslip_created_on,
        ...rest
      } = this.rowInfo;
      return rest;
    },
  },
  methods: {
    formatLabel(key) {
      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    },
    close_dialog() {
      this.$refs.form.resetValidation();
     
      this.$emit("clicked", 0);
    },

    async saveData() {
      if (this.$refs.form.validate()) {
        var updatedvalue = { ...this.rowInfo, ...this.filteredEmployeeData };
        this.rowInfo;
        delete updatedvalue.payslip_id;
     
        this.loading = true;

        try {
          let result = await API.graphql(
            graphqlOperation(edit_delete_payslips, {
              input: {
                Update_params: JSON.stringify([updatedvalue]),
                payslip_id: this.rowInfo.payslip_id,
                action_type: "UPDATE_PAYSLIP",
              },
            })
          );
          var response = JSON.parse(result.data.edit_delete_payslips);

          this.loading = false;

          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.$emit("usertimesheet", "dataValue");
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          this.$emit("errorMsg", error.errors[0].message);
          this.loading = false;
        }
      }
    },
  },
};
</script>