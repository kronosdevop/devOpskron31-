<template>
  <div>
    <v-card class="mt-n4" flatv  flat>
      <v-card-text>
        <v-form ref="form" >
          <v-row>
            <v-col cols="2">
              <v-text-field
                outlined
                dense
                v-model="headers_name"
                :rules="[(v) => !!v || 'Required']"
                label="Header"
              />
            </v-col>
            <!-- <v-col cols="2">
              <v-select
                v-model="header_data_type"
                dense
                outlined
                label="Data Type"
                :rules="[(v) => !!v || 'Required']"
                :items="itemsdataType"
              />
            </v-col> -->
            <!-- <v-col cols="1">
              <v-checkbox
                v-model="mandatorySetting"
                label="Mandatory"
                color="pink"
                class=""
              ></v-checkbox>
            </v-col> -->
            <v-col cols="2">
              <v-btn
                depressed
                @click="add_mutation()"
                dark
                small
                class="text-capitalize ml-2 mt-2 cardCss"
              >
                Add
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <v-data-table
          :headers="Payslipheader"
          :fixed-header="fixed"
          :items="payrecords"
          v-sortable-data-table
          :loading="tableLoading"
          hide-default-footer
          :items-per-page="100"
          @sorted="saveOrder"
          dense
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              small
              @click="open_delete(item)"
              color="red"
              v-if="
                item.headers_name != 'Email ID' &&
                item.headers_name != 'Employee Name'
              "
              >mdi-delete</v-icon
            >
            <div v-else class="ml-2">-</div>
          </template>
          <template v-slot:[`item.is_mandatory`]="{ item }">
            <div v-if="item.is_mandatory == true">
              <v-icon color="green">mdi-check-circle</v-icon>
            </div>

            <div v-else>
              <v-icon color="red">mdi-alpha-x-circle</v-icon>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          dark
          @click="validate_data()"
          v-if="payrecords.length != 0"
          :loading="loading"
          class="text-capitalize cardCss button-corner"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import { update_payslip_headers } from "@/graphql/mutations.js";
import SnackBar from "@/components/SnackBar.vue";
import { get_payslip_headers } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import Sortable from "sortablejs";
export default {
  components: {
    // Sortable,
    SnackBar,
  },
  data() {
    return {
      headers_name: "",
      tableLoading: false,
      header_id: "",
      loading: false,
      header_data_type: "",
      itemsdataType: ["Text", "Number"],
      mandatorySetting: false,
      fixed: true,
      payrecords: [],
      SnackBarComponent: {},
      Payslipheader: [
        // {
        //   text: "Sl No",
        //   value: "header_weightage",
        //   sortable: false,
        // },
        {
          text: "Headers",
          value: "headers_name",
          sortable: false,
        },
        // { text: "Data Type", value: "header_data_type", sortable: false },
        // { text: "Mandatory", value: "is_mandatory", sortable: false },

        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },
  directives: {
    sortableDataTable: {
      bind(el, binding, vnode) {
        const options = {
          animation: 150,
          onUpdate: function (event) {
            vnode.child.$emit("sorted", event);
          },
        };

        Sortable.create(el.getElementsByTagName("tbody")[0], options);
      },
    },
  },
  async mounted() {
    await this.fetch_usertimelist();
  },
  methods: {
    async fetch_usertimelist() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_payslip_headers, {
            input: {
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.get_payslip_headers);
        this.payrecords = [];
        if (response.Status == "SUCCESS") {
          this.payrecords = response.data[0].header_details;
          this.header_id = response.data[0].header_id;

          this.tableLoading = false;
        } else {
          this.payrecords = [];
          this.tableLoading = false;
        }
      } catch (error) {
        this.payrecords = [];
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    saveOrder(event) {
      const movedItem = this.payrecords.splice(event.oldIndex, 1)[0];
      this.payrecords.splice(event.newIndex, 0, movedItem);
      this.payrecords.forEach((item, index) => {
        item.header_weightage = index + 1;
      });
    },
    add_mutation() {
      if (this.$refs.form.validate()) {
        let maxWeightageNo = 0;
        if (this.payrecords.length > 0) {
          maxWeightageNo = Math.max(
            ...this.payrecords.map((record) => record.header_weightage)
          );
        }
        let newdata = {};
        newdata = {
          headers_name: this.headers_name,
          header_data_type: "String",
          is_mandatory: true,
          headers_placeholder:"{{"+ this.headers_name
            .toLowerCase()
            .replace(/ /g, "_") +"}}",

          // this.mandatorySetting == null ? false : this.mandatorySetting,
          header_weightage: maxWeightageNo + 1,
          headers_value: this.headers_name.replace(/ /g, "_"),
        };
        var hasMatchingCode = this.payrecords.some(
          (obj) =>
            obj.headers_name.toLowerCase() === this.headers_name.toLowerCase()
        );
        if (hasMatchingCode == false) {
          this.payrecords.push(newdata);

          this.$refs.form.reset();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: "Header already exists",
          };
        }
      }
    },
    open_delete(item) {
      const index = this.payrecords.indexOf(item);
      if (index !== -1) {
        this.payrecords.splice(index, 1);
        // Reassign header_weightage values to ensure they are consecutive
        this.payrecords.forEach((record, i) => {
          record.header_weightage = i + 1;
        });
      }
    },
    async validate_data() {
      this.payrecords = this.payrecords.map(({ header_weightage, ...rest }) => {
        // eslint-disable-next-line no-unused-vars
        return rest;
      });

      this.payrecords.forEach((obj, index) => {
        obj.header_weightage = index + 1;
      });
      await this.call_headersapi();
    },
    async call_headersapi() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(update_payslip_headers, {
            input: {
              header_id: this.header_id,
              header_details: this.payrecords,
              organization_id: data.organization.organization_id,
            },
          })
        );
        var response = JSON.parse(result.data.update_payslip_headers);

        this.loading = false;

        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.fetch_usertimelist();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.fetch_usertimelist();
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
        this.loading = false;
      }
    },
  },
};
</script>

<style>
</style>
