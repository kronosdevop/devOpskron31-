<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="dropExceldailog" @update:model-value="$emit('update:dropExceldailog', $event)" persistent max-width="800" transition="dialog-top-transition">
      <v-card height="500">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >   <div class="custom-title"> Upload Details
              </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-row class="mx-8 mt-2">
          <v-col cols="4">
            <v-row class="mt-2">
              <v-select
                variant="outlined"
                label="Dropdown List"
                class=""
                v-model="customerType"
                :items="headerList"
                density="compact"
              >
              </v-select>
            </v-row>

            <v-row justify="center">
              <v-spacer />
              <v-btn
                v-if="customerType != ''"
                @click="construct_valid_invalid()"
                class="cardCss white--text"
                dark
                small
                >Preview</v-btn
              >
              <!-- currency != '' && -->
            </v-row>
          </v-col>

          <v-col cols="8">
            <v-card flat>
              <v-data-table
                :headers="validHeaders"
                :items="UploadList.valid"
                density="compact"
                :height="300"
              >
                <template v-slot:[`no-data`]>
                  <v-alert class="">No details are Valid</v-alert>
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
        <v-card-actions class="justify-center">
          <v-btn
            
            v-if="headerList.length != 0 && validInputData.length != 0"
            @click="validate_data()"
            :loading="isLoadingUpload"
            class="text-capitalize cardCss button-corner mt-2 white--text"
            size="small"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */

export default {
  props: {
    dropExceldailog: Boolean,
    excelHeaders: Array,
    excelTableData: Array,
  },

  data() {
    return {
      customerType: "",
      headerList: [],
      validInputData: [],
      validHeaders: [],
      rules: {
        required: (value) => !!value || "Required.",
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || "Invalid Email";
        },
      },
      dataTable: [],
      UploadList: [],
      isLoadingUpload: false,
    };
  },
  watch: {
    dropExceldailog: {
      async handler() {
        if (this.dropExceldailog == true) {
          this.headerList = [];
          this.dataTable = [];
          this.headerList = this.excelHeaders;
          this.dataTable = this.excelTableData;
          this.clear_data();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async uploadDocument() {
      this.isLoadingUpload = true;
      try {
        let result = await API.graphql(
          graphqlOperation(CreateOrgBulkCustomers, {
            input: {
              org_id: Number(this.$store.getters.Getcurrentdetails.org_id),
              json_data: await this.fetch_records(),
            },
          })
        );

        var response = JSON.parse(result.data.CreateOrgBulkCustomers);
        this.isLoadingUpload = false;
        if (response.status == "success") {
          this.isLoadingUpload = false;
          this.$emit("successMsg", response.message);
        } else {
          this.$emit("errorMsg", response.message);
        }
      } catch (error) {
        // console.log(error);
        this.isLoadingUpload = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
    },

    construct_valid_invalid() {
      this.validHeaders = [{ title: "Dropdown List", key: this.customerType }];

      // console.log(this.dataTable);
      this.validInputData = this.dataTable;
      this.validate_mandatory_data();
    },

    clear_data() {
      this.customerType = "";
      this.validation;
      this.UploadList.valid = [];
      this.UploadList.invalid = [];
      this.validInputData = [];
    },

    validate_mandatory_data() {
      var self = this;
      self.UploadList = {
        valid: [],
        invalid: [],
      };

      this.validInputData.forEach((element) => {
        var valid = true;

        if (element[this.customerType] == undefined) {
          valid = false;
          this.UploadList.invalid.push(element);
        }

        if (valid) {
          this.UploadList.valid.push(element);
        }
      });
    },
    async validate_data() {
      var items = await this.fetch_records();
      // console.log(items);
      this.$emit("dropdown", items);
    },
    fetch_records() {
      let StoreValidUser = this.UploadList.valid;
      const self = this;
      const StoreValidUserArray = StoreValidUser.map((user) => {
        return {
          dropdownitems: user[self.customerType],
        };
      });
      // console.log(JSON.stringify(StoreValidUserArray));
      return StoreValidUserArray;
    },
  },
};
</script>